import { Octokit } from "@octokit/rest";
import { createNodeMiddleware } from "@octokit/webhooks";
import { WebhookEventMap } from "@octokit/webhooks-definitions/schema";
import * as http from "http";
import { App } from "octokit";
import { Review } from "./constants";
import { env } from "./env";
import { processPullRequest } from "./review-agent";
import { applyReview } from "./reviews";
import { generateChatCompletion } from "./llms/chat";
/**
 * SAMPLE TESTING APP
 */
const reviewApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_PRIVATE_KEY,
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
});
/**
 * SAMPLE TESTING APP
 */
const getFileContent = async (
  octokit: InstanceType<typeof App>["octokit"],
  owner: string,
  repo: string,
  path: string,
  ref: string
) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if ("content" in data) {
      // Decode the file content (it's base64-encoded)
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    return null; // In case the data does not contain content
  } catch (exc) {
    console.error(`Failed to fetch content for ${path}`, exc);
    return null;
  }
};

const getChangesWithFullContext = async (
  payload: WebhookEventMap["pull_request"]
) => {
  try {
    const octokit = await reviewApp.getInstallationOctokit(
      payload.installation.id
    );

    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
    });

    const fileContexts = await Promise.all(
      files.map(async (file) => {
        const content = await getFileContent(
          octokit,
          payload.repository.owner.login,
          payload.repository.name,
          file.filename,
          payload.pull_request.head.sha
        );
        return {
          ...file,
          fullContent: content,
        };
      })
    );

    console.dir({ fileContexts }, { depth: null });
    return fileContexts;
  } catch (exc) {
    console.error("Error fetching files with context:", exc);
    return [];
  }
};

// This adds an event handler that your code will call later. When this event handler is called, it will log the event to the console. Then, it will use GitHub's REST API to add a comment to the pull request that triggered the event.
async function handlePullRequestOpened({
  octokit,
  payload,
}: {
  octokit: Octokit;
  payload: WebhookEventMap["pull_request"];
}) {
  console.log(
    `Received a pull request event for #${payload.pull_request.number}`
  );

  try {
    console.log("PR info", {
      id: payload.repository.id,
      fullName: payload.repository.full_name,
      url: payload.repository.html_url,
    });

    const fileContexts = await getChangesWithFullContext(payload);

    const review: Review = await processPullRequest(
      octokit,
      payload,
      fileContexts,
      true // Assuming this indicates including full context
    );

    await applyReview({ octokit, payload, review });
    console.log("Review Submitted");
  } catch (exc) {
    console.error(exc);
  }
}

// This sets up a webhook event listener. When your app receives a webhook event from GitHub with a `X-GitHub-Event` header value of `pull_request` and an `action` payload value of `opened`, it calls the `handlePullRequestOpened` event handler that is defined above.
//@ts-ignore
reviewApp.webhooks.on("pull_request.opened", handlePullRequestOpened);

const port = process.env.PORT || 3000;
const reviewWebhook = `/api/review`;

const reviewMiddleware = createNodeMiddleware(reviewApp.webhooks, {
  path: "/api/review",
});

const server = http.createServer((req, res) => {
  if (req.url === reviewWebhook) {
    reviewMiddleware(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

// This creates a Node.js server that listens for incoming HTTP requests (including webhook payloads from GitHub) on the specified port. When the server receives a request, it executes the `middleware` function that you defined earlier. Once the server is running, it logs messages to the console to indicate that it is listening.
server.listen(port, () => {
  console.log(`Server is listening for events.`);
  console.log("Press Ctrl + C to quit.");
});
