"use strict";
import {
  commands,
  window,
  workspace,
  Disposable,
  ExtensionContext,
  Uri,
  ViewColumn,
  QuickPickOptions,
  OutputChannel,
} from "vscode";
import * as path from "path";
import * as vscode from "vscode";
import { Configuration } from "./configuration";

interface Command {
  commandName: string;
  key: string;
  method: Function;
}

interface State {
  query: string | undefined;
  preparedQuery?: string | undefined;
  files?: QuickPickItem[];
}

interface CommandArgs {
  state: State;
  selected: QuickPickItem;
}

type CommandType =
  | "omf.search"
  | "omf.start"
  | "omf.prompt"
  | "omf.openFile"
  | "omf.openFiles"
  | "omf.true"
  | "omf.false";

class QuickPickItem implements vscode.QuickPickItem {
  description: string;
  detail?: string | undefined;

  constructor(
    public label: string,
    public command: CommandType,
    public uri?: Uri | undefined,
    description?: string,
    detail?: string | undefined
  ) {
    this.label = label;
    this.command = command;
    this.uri = uri;
    this.description = description || "";
    this.detail = detail || "";
  }
}

const registry: Command[] = [];

function command(commandName: CommandType): Function {
  return (target: any, key: string, descriptor: any) => {
    if (!(typeof descriptor.value === "function"))
      throw new Error("must be a function");

    registry.push({ commandName, key, method: descriptor.value });
  };
}

export class CommandCenter extends Disposable {
  private disposables: Disposable[];
  private configuration: Configuration;
  private placeholder = `Search for a specific file name or use glob patterns like **∕*.{ts,js} or *.{ts,js}`;

  constructor(context: ExtensionContext, private outputChannel: OutputChannel) {
    super(() => {
      this.disposables.forEach((_) => _.dispose());
    });

    this.configuration = new Configuration();
    this.disposables = registry.map(({ commandName, key, method }) => {
      var disposable = commands.registerCommand(
        commandName,
        (...args: any[]) => {
          return Promise.resolve(method.apply(this, args));
        }
      );
      context.subscriptions.push(disposable);
      return disposable;
    });
  }

  async initialize(args?: CommandArgs) {
    return this.start(args);
  }

  @command("omf.start")
  private async start(args?: CommandArgs): Promise<{} | undefined> {
    const query = await window.showInputBox({
      value: args && args.state.query,
      placeHolder: this.placeholder,
    });
    return this.search({ query: query });
  }

  private async restart(
    currentQuery: string,
    prompt?: string
  ): Promise<{} | undefined> {
    const query = await window.showInputBox({
      value: currentQuery,
      placeHolder: this.placeholder,
      prompt: prompt || `No results for ${currentQuery}`,
    });
    return this.search({ query: query });
  }

  @command("omf.search")
  private async search(state: State): Promise<{} | undefined> {
    if (!state.query) return;

    let queryValue = this.buildQuery(state.query);
    state.preparedQuery = queryValue;
    let foundFiles;
    try {
      foundFiles = await workspace.findFiles(queryValue);
    } catch (x) {
      return await this.restart(
        state.query,
        `Error parsing glob ${state.query}`
      );
    }

    if (!foundFiles || !foundFiles.length) {
      return await this.restart(state.query);
    }

    const files = this.toQuickPickItems(foundFiles);
    state.files = files;

    return this.pickFiles(state);
  }

  private async select(
    state: State,
    items: QuickPickItem[],
    options?: QuickPickOptions
  ): Promise<{} | undefined> {
    const pick = await window.showQuickPick(items, options);
    return (
      pick &&
      (await commands.executeCommand(pick.command, {
        state: state,
        selected: pick,
      } as CommandArgs))
    );
  }

  private async pickFiles(state: State): Promise<{} | undefined> {
    const files = state.files as QuickPickItem[];
    const items = [
      new QuickPickItem(
        `\u21b3 Open ${files.length} file${
          files.length > 1 ? "s" : ""
        } matching "${state.query}"`,
        "omf.openFiles"
      ),
      new QuickPickItem(`\u21a9 Go back`, "omf.start"),
    ].concat(files);

    const pick = await window.showQuickPick(items, { placeHolder: "" });
    return (
      pick &&
      (await commands.executeCommand(pick.command, {
        state: state,
        selected: pick,
      } as CommandArgs))
    );
  }

  @command("omf.openFiles")
  private async files(args: CommandArgs) {
    if (!args || !args.state.files) return;

    const limit = this.configuration.get<number>("openFilesConfirmationLimit");
    if (limit > 0 && args.state.files.length >= limit) {
      const confirm = await this.confirm(
        `Are you sure you want to open ${args.state.files.length} files?`
      );
      if (!confirm || confirm.command === "omf.false") {
        return Promise.resolve();
      }
    }

    args.state.files.forEach(async (item) => {
      const doc = await workspace.openTextDocument(item.uri as Uri);
      await window.showTextDocument(doc, {
        preview: false,
        preserveFocus: true,
        viewColumn: ViewColumn.Active,
      });
    });
  }

  @command("omf.openFile")
  private async file(args: CommandArgs) {
    const doc = await workspace.openTextDocument(args.selected.uri as Uri);
    await window.showTextDocument(doc, {
      preview: false,
      preserveFocus: true,
      viewColumn: ViewColumn.Active,
    });
  }

  private confirm(placeHolder: string) {
    return window.showQuickPick(
      [
        new QuickPickItem("No", "omf.false"),
        new QuickPickItem("Yes", "omf.true"),
      ],
      {
        placeHolder: placeHolder,
      }
    );
  }

  private charAtIsUpper(chr: string) {
    return /[A-Z]|[\u0080-\u024F]/.test(chr) && chr === chr.toUpperCase();
  }

  private charAtIsLower(chr: string) {
    return /[a-z]|[\u0080-\u024F]/.test(chr) && chr === chr.toLowerCase();
  }

  private buildQuery(query: string): string {
    const results: string[] = [];
    const arr = query.split("");

    if (query.indexOf("**/") === -1) {
      results.push("**/");
    }

    for (let i = 0; i < arr.length; i++) {
      let buffer = "";
      const chr = arr[i];
      if (chr === "{") {
        while (i < arr.length) {
          const f = arr[i];
          buffer += f;
          if (f === "}") {
            break;
          } else {
            i++;
          }
        }
      }
      if (buffer) {
        results.push(buffer);
      } else {
        if (this.charAtIsUpper(chr)) {
          results.push(`{${chr.toLocaleLowerCase()},${chr}}`);
        } else if (this.charAtIsLower(chr)) {
          results.push(`{${chr},${chr.toLocaleUpperCase()}}`);
        } else {
          results.push(chr);
        }
      }
    }
    return results.join("");
  }

  private toQuickPickItems(uris: Uri[]): QuickPickItem[] {
    return uris
      .map((uri) => {
        const fsWorkspaceFolder =
          workspace && workspace.getWorkspaceFolder(uri);
        if (!fsWorkspaceFolder) return null;

        const fsPath = fsWorkspaceFolder.uri.fsPath;
        if (!fsPath) return null;

        const item = path.relative(fsPath, uri.fsPath);
        return new QuickPickItem(
          "     " + path.basename(item),
          "omf.openFile",
          uri,
          path.dirname(item)
        );
      })
      .sort((a: QuickPickItem | null, b: QuickPickItem | null) => {
        if (!a || !b) return 0;

        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
      }) as QuickPickItem[];
  }
}
