var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as vscode from "vscode";
import { getWebviewOptions } from "./getWebviewOptions";
import { PreviewPanel } from "./PreviewPanel";
export function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("PreviewPanel.start", () => {
        PreviewPanel.createOrShow(context.extensionUri);
    }));
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(PreviewPanel.viewType, {
            deserializeWebviewPanel(webviewPanel, state) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`Got state: ${state}`);
                    webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                    PreviewPanel.revive(webviewPanel, context.extensionUri);
                });
            },
        });
    }
}
//# sourceMappingURL=extension.js.map