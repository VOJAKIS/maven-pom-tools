import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { appendToExistingPropertiesBlock, noPropertiesBlock, MyTest, versionPropertyExistsUserChangeToExistingProperty, versionPropertyExistsUserEntersNewName } from './testFiles';
import { EXTRACT_DEPENDENCY_VERSION } from '../../commands';

suite('Extract Dependency Version Command Test Suite', () => {
	let sandbox: sinon.SinonSandbox;

	// Runs before each test
	setup(() => {
		sandbox = sinon.createSandbox();
	});

	// Runs after each test
	teardown(() => {
		sandbox.restore();
	});

	/**
	 * Helper function to automate the test flow.
	 */
	async function runExtractionTest(
		testGoods: MyTest,
		setupMocks?: (sandbox: sinon.SinonSandbox) => void
	) {
		// 1. Open a virtual document
		const document = await vscode.workspace.openTextDocument({
			language: 'xml',
			content: testGoods.initial
		});
		await vscode.window.showTextDocument(document);

		// 2. Setup user interaction mocks (if any)
		if (setupMocks) {
			setupMocks(sandbox);
		}

		// 3. Simulate the Code Action Provider logic (finding arguments)
		const text = document.getText();
		const artifactMatch = text.match(/<artifactId>([^<]+)<\/artifactId>/);
		const versionMatch = text.match(/<version>([^<]+)<\/version>/);

		assert.ok(artifactMatch && versionMatch, "Invalid initial XML structure for testing");

		const artifactId = artifactMatch[1].trim();
		const versionValue = versionMatch[1].trim();

		// Find the exact range of the version value
		const versionStartInDoc = text.indexOf(versionValue, text.indexOf('<version>'));
		const versionValueRange = new vscode.Range(
			document.positionAt(versionStartInDoc),
			document.positionAt(versionStartInDoc + versionValue.length)
		);

		// 4. Execute our command (this simulates the user clicking the lightbulb action)
		await vscode.commands.executeCommand(
			EXTRACT_DEPENDENCY_VERSION.command,
			document,
			artifactId,
			versionValue,
			versionValueRange
		);

		// 5. Assert the final text matches the expected text
		assert.strictEqual(document.getText(), testGoods.expected);

		// 6. Cleanup the editor
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	}

	test('Scenario 1: Creates <properties> block if it does not exist', async () => {
		await runExtractionTest(noPropertiesBlock);
	});

	test('Scenario 2: Appends to existing <properties> block', async () => {
		await runExtractionTest(appendToExistingPropertiesBlock);
	});

	test('Scenario 3: Property exists, user chooses "Change to existing property"', async () => {
		await runExtractionTest(versionPropertyExistsUserChangeToExistingProperty, (sandbox) => {
			// Mock QuickPick to simulate user selecting the FIRST option ("Change to existing property")
			sandbox.stub(vscode.window, 'showQuickPick').resolves({
				label: 'Change to existing property'
			} as vscode.QuickPickItem);
		});
	});

	test('Scenario 4: Property exists, user chooses "Enter a new name"', async () => {
		await runExtractionTest(versionPropertyExistsUserEntersNewName, (sandbox) => {
			// Mock QuickPick to simulate user selecting the SECOND option
			sandbox.stub(vscode.window, 'showQuickPick').resolves({
				label: 'Enter a new name'
			} as vscode.QuickPickItem);

			// Mock InputBox to simulate user typing "spring-retry-me.version"
			sandbox.stub(vscode.window, 'showInputBox').resolves('spring-retry-me.version');
		});
	});
});