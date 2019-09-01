const assert = require("assert");
const { before, afterEach } = require("mocha");
const vscode = require("vscode");

suite("Extension Test Suite", function() {
  let document, editor;
  this.timeout(10000);
  before(async () => {
    document = await vscode.workspace.openTextDocument({
      language: "javascript"
    });
    editor = await vscode.window.showTextDocument(document);
  });

  afterEach(async () => {
    await clearEditor();
  });

  test("Converts a simple return statement", async () => {
    await setCode("return x;");
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return (a => console.log(a) || a)(x);");
  });

  test("Reverts a simple return statement", async () => {
    await setCode("return (a => console.log(a) || a)(x);");
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return x;");
  });

  test("Converts a one-line object return statement", async () => {
    await setCode("return { x: 1 };");
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return (a => console.log(a) || a)({ x: 1 });");
  });

  test("Reverts a one-line object return statement", async () => {
    await setCode("return (a => console.log(a) || a)({ x: 1 });");
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return { x: 1 };");
  });

  test("Converts a one-line function return statement", async () => {
    await setCode("return () => { return x; });");
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return (a => console.log(a) || a)(() => { return x; }));");
  });

  test("Reverts a one-line function return statement", async () => {
    await setCode("return (a => console.log(a) || a)(() => { return x; }));");
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return () => { return x; });");
  });

  test("Converts a selection of a one-line return statement", async () => {
    await setCode("return x;");
    editor.selection = new vscode.Selection(0, 7, 0, 8);
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return (a => console.log(a) || a)(x);");
  });

  test("Reverts a selection of a one-line return statement", async () => {
    await setCode("return (a => console.log(a) || a)(x);");
    editor.selection = new vscode.Selection(0, 7, 0, 36);
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("return x;");
  });

  test("Converts a selection of a one-line assignment statement", async () => {
    await setCode("let y = x;");
    editor.selection = new vscode.Selection(0, 8, 0, 9);
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("let y = (a => console.log(a) || a)(x);");
  });

  test("Reverts a selection of a one-line assignment statement", async () => {
    await setCode("let y = (a => console.log(a) || a)(x);");
    editor.selection = new vscode.Selection(0, 8, 0, 37);
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode("let y = x;");
  });

  test("Converts a selection of a multi-line return statement", async () => {
    await setCode(
      `
			return {
				x: 1,
				y: 2
			};
			`
    );
    editor.selection = new vscode.Selection(1, 10, 4, 4);
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode(
      `
			return (a => console.log(a) || a)({
				x: 1,
				y: 2
			});
			`
    );
  });

  test("Reverts a selection of a multi-line return statement", async () => {
    await setCode(
      `
			return (a => console.log(a) || a)({
				x: 1,
				y: 2
			});
			`
    );
    editor.selection = new vscode.Selection(1, 10, 4, 5);
    await vscode.commands.executeCommand("extension.logReturnValue");
    assertCode(
      `
			return {
				x: 1,
				y: 2
			};
			`
    );
  });

  async function setCode(code) {
    await editor.edit(editBuilder =>
      editBuilder.insert(new vscode.Position(0, 0), code)
    );
  }

  function assertCode(code) {
    assert.equal(editor.document.getText(), code);
  }

  async function clearEditor() {
    const lineCount = document.lineCount;
    const startOfFile = document.lineAt(0).range.start;
    const endOfFile = document.lineAt(lineCount - 1).range.end;
    const range = new vscode.Range(startOfFile, endOfFile);
    await editor.edit(editBuilder => editBuilder.delete(range));
  }
});

async function sleep(duration) {
  await new Promise(res => setTimeout(res, duration));
}
