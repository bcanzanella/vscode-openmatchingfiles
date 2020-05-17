import * as assert from "assert";
import * as vscode from "vscode";
import { CommandCenter } from "../../commands";

suite("Extension Test Suite", async () => {
  vscode.window.showInformationMessage("Start all tests.");
  const commands = new CommandCenter(undefined, undefined);
  [
    ["*.csproj", 2],
    [".gitignore", 3],
    ["index.html", 1],
    ["project.yaml", 3],
    ["projec*.yaml", 3],
    ["proje*.yaml", 3],
    ["proj*.yaml", 3],
    ["pro*.yaml", 3],
    ["pr*.yaml", 3],
    ["p*.yaml", 3],
    ["*.yaml", 3],
    ["web.config", 3],
    ["WEB.CONFIG", 3],
    ["data.cs", 1],
    ["**/*.{htm,html}", 2],
  ].forEach((args) => {
    test(`query can be found(${args[0]})`, async () => {
      const built = commands.buildQuery(args[0] as string);
      const actual = await vscode.workspace.findFiles(built);
      assert.equal(actual.length, args[1]);
    });
  });

  [["**/xyz"], ["foo"], ["**/*.{HTM,HTML}"], ["bar.html"], ["file.h"]].forEach(
    (args) => {
      test(`query cannot be found(${args[0]})`, async () => {
        const actual = await vscode.workspace.findFiles(
          commands.buildQuery(args[0] as string)
        );
        assert.equal(actual.length, 0);
      });
    }
  );
});
