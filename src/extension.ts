'use strict';
import {
    commands, ExtensionContext
} from 'vscode';
 
import { CommandCenter } from './commands';

export function activate(context: ExtensionContext) {
    //const ch = window.createOutputChannel('openMatchingFiles');
    const disposableOpenMatchingFilesCommand = commands.registerCommand('extension.openMatchingFiles', async () => {

        // const disposables: Disposable[] = [];
        // context.subscriptions.push(new Disposable(() => {
        //     Disposable.from(...disposables).dispose();
        // }
        // ));

        var cc = new CommandCenter(context);
        //disposables.push(cc);
        await cc.start();
        cc.dispose();
        // init(context, disposables).catch(err => console.error(err));
    });
    context.subscriptions.push(disposableOpenMatchingFilesCommand);
}


export function deactivate(context: ExtensionContext) {
}
