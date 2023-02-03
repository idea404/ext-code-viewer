import * as vscode from "vscode";
import { getWidgetWithCode, getWebviewOptions } from "./helpers";
import { NearSocialViewer } from "./NearSocialViewer";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("NearSocial.start", () => {
      NearSocialViewer.createOrShow(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("type", (args) => {
      setTimeout(() => {
        if (NearSocialViewer.currentPanel) {
          NearSocialViewer.currentPanel.updateCode(getWidgetWithCode());
        }
      }, 50);

      return vscode.commands.executeCommand("default:type", args);
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(NearSocialViewer.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        NearSocialViewer.revive(webviewPanel, context);
      },
    });
  }
}
