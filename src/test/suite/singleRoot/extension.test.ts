import * as assert from "assert";
import * as vscode from "vscode";
import { CommandCenter } from "../../../commands";

suite("Extension Test Suite", async () => {
  vscode.window.showInformationMessage("Start all singleRoot tests.");
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
      const results = await commands.searchCore({ query: args[0] as string });
      assert.equal(results.length, args[1]);
    });
  });

  [["**/xyz"], ["foo"], ["**/*.{HTM,HTML}"], ["bar.html"], ["file.h"]].forEach(
    (args) => {
      test(`query cannot be found(${args[0]})`, async () => {
        const results = await commands.searchCore({ query: args[0] as string });
        assert.equal(results.length, 0);
      });
    }
  );

  [["text*"]].forEach((args) => {
    test(`query returns sorted files(${args[0]})`, async () => {
      const uris = await commands.searchCore({ query: args[0] as string });
      const quickPicks = commands.toQuickPickItems(uris);
      const workspaceFolder = vscode.workspace.workspaceFolders![0];
      assert.equal(
        quickPicks[0].uri?.toString(),
        `${workspaceFolder.uri}/source/text/text0.txt`
      );
      assert.equal(
        quickPicks[quickPicks.length - 1].uri?.toString(),
        `${workspaceFolder.uri}/source/text/z/text100.txt`
      );
    });
  });
  
});
