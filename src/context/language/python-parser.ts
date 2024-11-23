import { AbstractParser, EnclosingContext } from "../../constants";
import { spawnSync } from "child_process";

export class PythonParser implements AbstractParser {
  findEnclosingContext(
    file: string,
    lineStart: number,
    lineEnd: number
  ): EnclosingContext {
    const pythonScript = "./path/to/python_ast_parser.py"; // Adjust the path

    try {
      const result = spawnSync(
        "python3",
        [pythonScript, lineStart.toString(), lineEnd.toString()],
        {
          input: file,
          encoding: "utf-8",
        }
      );

      if (result.error) {
        throw result.error;
      }

      const output = JSON.parse(result.stdout.trim());
      if (output.error) {
        throw new Error(output.error);
      }

      return {
        enclosingContext: output.enclosing_context,
      } as EnclosingContext;
    } catch (err) {
      console.error("Error parsing Python file:", err);
      return {
        enclosingContext: null,
      } as EnclosingContext;
    }
  }

  dryRun(file: string): { valid: boolean; error: string } {
    const pythonScript = "./path/to/python_ast_parser.py"; // Adjust the path

    try {
      const result = spawnSync("python3", [pythonScript, "0", "0"], {
        input: file,
        encoding: "utf-8",
      });

      if (result.error) {
        throw result.error;
      }

      const output = JSON.parse(result.stdout.trim());
      if (output.error) {
        throw new Error(output.error);
      }

      return { valid: true, error: "" };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }
}
