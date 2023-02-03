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
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const helpers_1 = require("./helpers");
const NearSocialViewer_1 = require("./NearSocialViewer");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("NearSocial.start", () => {
        NearSocialViewer_1.NearSocialViewer.createOrShow(context);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("type", (args) => {
        setTimeout(() => {
            if (NearSocialViewer_1.NearSocialViewer.currentPanel) {
                NearSocialViewer_1.NearSocialViewer.currentPanel.updateCode((0, helpers_1.getWidgetWithCode)());
            }
        }, 50);
        return vscode.commands.executeCommand("default:type", args);
    }));
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(NearSocialViewer_1.NearSocialViewer.viewType, {
            async deserializeWebviewPanel(webviewPanel, state) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = (0, helpers_1.getWebviewOptions)(context.extensionUri);
                NearSocialViewer_1.NearSocialViewer.revive(webviewPanel, context);
            },
        });
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map