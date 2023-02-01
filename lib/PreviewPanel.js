import * as vscode from 'vscode';
import { getWebviewOptions } from "./getWebviewOptions";
import * as path from 'path';
import * as fs from 'fs';
const NETWORK = "mainnet";
let extensionContext;
let currentWidgetCode;
export class PreviewPanel {
    static createOrShow(extensionUri) {
        const column = vscode.ViewColumn.Two;
        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel(PreviewPanel.viewType, 'NEAR Social', column, getWebviewOptions(extensionUri));
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }
    static revive(panel, extensionUri) {
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState(e => {
            console.log(`Panel: ${e.webviewPanel.visible}`);
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    alert(message.text);
                    break;
                case 'publish':
                    return;
                case 'login':
                    return;
                case 'confirm-login':
                    return;
                case 'sign-out':
                    return;
            }
        }, null, this._disposables);
    }
    dispose() {
        PreviewPanel.currentPanel = undefined;
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
    getPanel(conext) {
        const filePath = vscode.Uri.file(path.join(conext.extensionPath, 'media', 'panel.html'));
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
PreviewPanel.viewType = 'NearSocialPanel';
function getWidgetWithCode() {
    var _a, _b;
    currentWidgetCode = (_b = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.getText()) !== null && _b !== void 0 ? _b : "";
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