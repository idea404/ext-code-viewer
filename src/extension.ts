import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import AuthSettings from "./auth";

const NETWORK = "mainnet";

let extensionContext: vscode.ExtensionContext;
let currentWidgetCode: string;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;
  AuthSettings.init(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("NearSocial.start", () => {
      ExtPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("type", (args) => {
      setTimeout(() => {
        if (ExtPanel.currentPanel) {
          ExtPanel.currentPanel.updateCode(getWidgetWithCode());
        }
      }, 50);

      return vscode.commands.executeCommand("default:type", args);
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(ExtPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        ExtPanel.revive(webviewPanel, context.extensionUri);
      },
    });
  }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
  };
}

/**
 * Manages cat coding webview panels
 */
class ExtPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ExtPanel | undefined;

  public static readonly viewType = "NearSocialPanel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.ViewColumn.Two;

    // If we already have a panel, show it.
    if (ExtPanel.currentPanel) {
      ExtPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(ExtPanel.viewType, "NEAR Social", column, getWebviewOptions(extensionUri));

    ExtPanel.currentPanel = new ExtPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    ExtPanel.currentPanel = new ExtPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "alert":
            alert(message.text);
            break;
          case "publish":
            // this.Publish(message.name, message.tag);
            return;

          case "login":
            // this.NearSignin(NETWORK, getContractId(NETWORK));
            return;

          case "confirm-login":
            // this.CheckPublicKey(NETWORK, undefined);
            return;

          case "sign-out":
            // this.DeleteKey();
            // setTimeout(() => this.SendAccountDetails(), 500);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public updateCode(code: string) {
    if (code) {
      this._panel.webview.postMessage({ command: "update-code", code });
    }
  }

  public dispose() {
    ExtPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.title = "NEAR Social";
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private getPanel(context: vscode.ExtensionContext): string {
    const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, "media", "panel.html"));
    return fs.readFileSync(filePath.fsPath, "utf8");
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, "media", "main.js");
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "media", "reset.css");
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css");

    return this.getPanel(extensionContext)
      .replaceAll("{{cspSource}}", webview.cspSource)
      .replaceAll("{{nonce}}", getNonce())
      .replace("{{widgetCode}}", getWidgetWithCode())
      .replace("{{stylesResetUri}}", webview.asWebviewUri(styleResetPath).toString())
      .replace("{{stylesMainUri}}", webview.asWebviewUri(stylesPathMainPath).toString())
      .replace("{{scriptUri}}", webview.asWebviewUri(scriptPathOnDisk).toString());
  }
}

function getWidgetUrl(network: string) {
  return network === "testnet"
    ? "https://test.near.social/#/embed/test_alice.testnet/widget/remote-code?code="
    : "https://near.social/#/embed/zavodil.near/widget/remote-code?code=";
}

function alert(text: string) {
  vscode.window.showInformationMessage(text);
}

function getWidgetWithCode(): string {
  currentWidgetCode = vscode.window.activeTextEditor?.document.getText() ?? "";
  return getWidgetUrl(NETWORK) + encodeURIComponent(currentWidgetCode);
}

function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
