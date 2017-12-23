
'use strict';
import {
    commands, window, workspace, Disposable, ExtensionContext, Uri, ViewColumn, QuickPickOptions
} from 'vscode';
import * as path from 'path';
import * as vscode from 'vscode';
import {Configuration} from './configuration';

interface Command {
    commandName: string;
    key: string;
    method: Function;
}

interface State {
    query: string | undefined;
    files?: QuickPickItem[];
}

interface CommandArgs {
    state: State;
    selected: QuickPickItem;
}

type CommandType =
    'omf.search' | 
    'omf.start' |
    'omf.prompt' |
    'omf.openFile' |
    'omf.true' |
    'omf.false'
    ;

class QuickPickItem implements vscode.QuickPickItem {
    description: string;
    detail?: string | undefined;

    constructor(public label: string, public command: CommandType, public uri?: Uri | undefined, description?: string, detail?: string | undefined) {
        this.label = label;
        this.command = command;
        this.uri = uri;
        this.description = description || '';
        this.detail = detail || '';
    }
}

const registry: Command[] = [];

function command(commandName: CommandType): Function {
    return (target: any, key: string, descriptor: any) => {
        if (!(typeof descriptor.value === 'function')) throw new Error('must be a function');

        registry.push({ commandName, key, method: descriptor.value });
    };
}

export class CommandCenter extends Disposable {
    private disposables: Disposable[];
    private configuration: Configuration;

    constructor(context: ExtensionContext) {
        super(() => { this.disposables.forEach(_ => _.dispose()); });
        
        this.configuration = new Configuration();
        this.disposables = registry.map(({ commandName, key, method }) => {
            var disposable = commands.registerCommand(commandName, (...args: any[]) => {
                return Promise.resolve(method.apply(this, args));
            });
            context.subscriptions.push(disposable);
            return disposable;
        });
    }

    @command('omf.start')
    async start(args?: CommandArgs) {
        const query = await window.showInputBox({
            value: (args && args.state.query), placeHolder: `Search for a specific file name or use glob patterns like **∕*.{ts,js} or *.{ts,js}`
        });
        return this.search({ query: query });
    }

    @command('omf.search')
    async search(state: State): Promise<{} | undefined> {
        if (!state.query) return;

        let queryValue = state.query;
        if (!state.query.endsWith('*')) { queryValue += '*'; }

        const foundFiles = await workspace.findFiles(`**/${queryValue}`);
        if (!foundFiles || !foundFiles.length) {
            return this.select(state, [new QuickPickItem(`\u21a9 No results for ${state.query}. (Press 'Enter' to go back or 'Escape' to cancel)`, 'omf.start')], {
                placeHolder: state.query
            })
        }

        const files = this.toQuickPickItems(foundFiles);
        state.files = files;

        return this.pickFiles(state, files);
    }

    private async select(state: State, items: QuickPickItem[], options?: QuickPickOptions) {
        const pick = await window.showQuickPick(items, options);
        return pick && await commands.executeCommand(pick.command, { state: state, selected: pick } as CommandArgs)
    }

    private async pickFiles(state: State, files: QuickPickItem[]) {
        const items = [
            new QuickPickItem(`\u21b3 Open ${files.length} file${files.length > 1 ? 's' : ''} matching "${state.query}"`, 'omf.openFile'),
            new QuickPickItem(`\u21a9 Go back`, 'omf.start')
        ].concat(files);

        const pick = await window.showQuickPick(items, { placeHolder: '' });
        return pick && await commands.executeCommand(pick.command, { state: state, selected: pick } as CommandArgs)
    }

    @command('omf.openFile')
    private async file(args: CommandArgs) {
        if (!args || !args.state.files) return;

        const limit = this.configuration.get<number>('openFilesConfirmationLimit');
        if (limit > 0 && args.state.files.length >= limit) {
            const confirm = await this.confirm(`Are you sure you want to open ${args.state.files.length} files?`);
            if (!confirm || confirm.command === 'omf.false') {
                return Promise.resolve();
            }
        }

        args.state.files.forEach(async item => {
            const doc = await workspace.openTextDocument(item.uri as Uri);
            await window.showTextDocument(doc, { preview: false, preserveFocus: true, viewColumn: ViewColumn.Active });
        });
    }

    private confirm(placeHolder: string) {
        return window.showQuickPick([new QuickPickItem("No", 'omf.false'), new QuickPickItem("Yes", 'omf.true')],
            {
                placeHolder: placeHolder
            });
    }

    toQuickPickItems(uris: Uri[]): QuickPickItem[] {
        return uris.map(uri => {
            const fsWorkspaceFolder = workspace && workspace.getWorkspaceFolder(uri);
            if (!fsWorkspaceFolder) return null;

            const fsPath = fsWorkspaceFolder.uri.fsPath;
            if (!fsPath) return null;

            const item = path.relative(fsPath, uri.fsPath);
            return new QuickPickItem('     ' + path.basename(item), 'omf.openFile', uri, path.dirname(item));
        }).sort((a: QuickPickItem | null, b: QuickPickItem | null) => {
            if (!a || !b) return 0;

            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            if (a.description < b.description) return -1;
            if (a.description > b.description) return 1;
            return 0;
        }) as QuickPickItem[];
    }
}