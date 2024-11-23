import { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";
import { groq, GROQ_MODEL } from "./groq";

export const generateChatCompletion = async function createChatCompletion({
  options,
}: {
  options: Omit<ChatCompletionCreateParamsNonStreaming, "model">;
}) {
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      ...options,
    });
    return response.choices[0].message;
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Another example of a chat completion
 */
