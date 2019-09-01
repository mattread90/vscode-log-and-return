const vscode = require("vscode");

const returnValueRegExp = /^(\s*)return[\s\n]+([\s\S]+);[\s\n]*$/g;
const revertRegExp = /^(\s*(?:return)?\s*)(?:\(a => console\.log\(a\) \|\| a\)\()([\s\S]+)\)(\s*;*\s*)$/g;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const logReturnValue = vscode.commands.registerCommand(
    "extension.logReturnValue",
    async function() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No editor open!");
        return;
      }

      const selection = editor.selection;

      const textSelection = editor.document.getText(selection);
      const currentLine = editor.document.lineAt(selection.active.line);
      currentLine.range;

      const returnStatement = textSelection || currentLine.text;
      const range = textSelection
        ? new vscode.Range(selection.start, selection.end)
        : currentLine.range;

      const revertMatch = revertRegExp.exec(returnStatement);
      revertRegExp.lastIndex = 0;
      if (revertMatch) {
        const prefix = revertMatch[1];
        const statement = revertMatch[2];
        const suffix = revertMatch[3];
        await editor.edit(editBuilder => {
          editBuilder.replace(range, `${prefix}${statement}${suffix}`);
        });
        return;
      }

      const match = returnValueRegExp.exec(returnStatement);
      returnValueRegExp.lastIndex = 0;
      if (match) {
        const indentation = match[1];
        const returnValue = match[2];
        await editor.edit(editBuilder => {
          editBuilder.replace(
            range,
            `${indentation}return (a => console.log(a) || a)(${returnValue});`
          );
        });
      } else if (textSelection) {
        await editor.edit(editBuilder => {
          editBuilder.replace(
            range,
            `(a => console.log(a) || a)(${textSelection})`
          );
        });
      } else {
        vscode.window.showInformationMessage("No return statement detected!");
        return;
      }
    }
  );

  context.subscriptions.push(logReturnValue);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
