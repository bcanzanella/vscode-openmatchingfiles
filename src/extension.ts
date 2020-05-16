"use strict";
import * as vscode from "vscode";
import { CommandCenter } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("openMatchingFiles");
  let commandCenter: CommandCenter;
  const disposableOpenMatchingFilesCommand = vscode.commands.registerCommand(
    "extension.openMatchingFiles",
    async () => {
      try {
        commandCenter = new CommandCenter(context, outputChannel);
        await commandCenter.initialize();
      } catch (x) {
        console.error(x);
      }

      if (commandCenter) {
        commandCenter.dispose();
      }
    }
  );

  context.subscriptions.push(outputChannel);
  context.subscriptions.push(disposableOpenMatchingFilesCommand);
}

export function deactivate(context: vscode.ExtensionContext) {}
