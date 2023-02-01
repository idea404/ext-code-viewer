import * as vscode from "vscode";
import { getWebviewOptions } from "./getWebviewOptions";
import { PreviewPanel } from "./PreviewPanel";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("PreviewPanel.start", () => {
            PreviewPanel.createOrShow(context.extensionUri);
        })
    );

    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(PreviewPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                PreviewPanel.revive(webviewPanel, context.extensionUri);
            },
        });
    }
}
