import * as vscode from 'vscode';
export function getWebviewOptions(extensionUri) {
    return {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    };
}
//# sourceMappingURL=getWebviewOptions.js.map