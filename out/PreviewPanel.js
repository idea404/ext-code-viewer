"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewPanel = void 0;
const vscode = __importStar(require("vscode"));
const getWebviewOptions_1 = require("./getWebviewOptions");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const NETWORK = "mainnet";
let extensionContext;
let currentWidgetCode;
class PreviewPanel {
    static createOrShow(extensionUri) {
        const column = vscode.ViewColumn.Two;
        // If we already have a panel, show it.
        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(PreviewPanel.viewType, 'NEAR Social', column, (0, getWebviewOptions_1.getWebviewOptions)(extensionUri));
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }
    static revive(panel, extensionUri) {
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            console.log(`Panel: ${e.webviewPanel.visible}`);
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    alert(message.text);
                    break;
                case 'publish':
                    // this.Publish(message.name, message.tag);
                    return;
                case 'login':
                    // this.NearSignIn(NETWORK, getContractId(NETWORK));
                    return;
                case 'confirm-login':
                    // this.CheckPublicKey(NETWORK, undefined);
                    return;
                case 'sign-out':
                    // this.DeleteKey();
                    // setTimeout(() => this.SendAccountDetails(), 500);
                    return;
            }
        }, null, this._disposables);
    }
    dispose() {
        PreviewPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.title = "NEAR Social";
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    getPanel(context) {
        const filePath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'panel.html'));
        return fs.readFileSync(filePath.fsPath, 'utf8');
    }
    _getHtmlForWebview(webview) {
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
        const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
        return this.getPanel(extensionContext)
            .replaceAll("{{cspSource}}", webview.cspSource)
            .replaceAll("{{nonce}}", getNonce())
            .replace("{{widgetCode}}", getWidgetWithCode())
            .replace("{{stylesResetUri}}", webview.asWebviewUri(styleResetPath).toString())
            .replace("{{stylesMainUri}}", webview.asWebviewUri(stylesPathMainPath).toString())
            .replace("{{scriptUri}}", webview.asWebviewUri(scriptPathOnDisk).toString());
    }
}
exports.PreviewPanel = PreviewPanel;
PreviewPanel.viewType = 'NearSocialPanel';
function getWidgetWithCode() {
    currentWidgetCode = vscode.window.activeTextEditor?.document.getText() ?? "";
    return getWidgetUrl(NETWORK) + encodeURIComponent(currentWidgetCode);
}
function getWidgetUrl(network) {
    return network === "testnet"
        ? "https://test.near.social/#/embed/test_alice.testnet/widget/remote-code?code="
        : "https://near.social/#/embed/zavodil.near/widget/remote-code?code=";
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=PreviewPanel.js.map