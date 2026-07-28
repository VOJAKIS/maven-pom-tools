import * as vscode from 'vscode';
import { DependencyVersionCodeActionProvider } from './DependencyVersionCodeActionProvider';
import { extractDependencyVersionCommand } from './extractDependencyVersionCommand';
import { EXTRACT_DEPENDENCY_VERSION } from './commands';

export function activate(context: vscode.ExtensionContext) {
	// 1. Register the Lightbulb (Code Action)
	const codeAction = vscode.languages.registerCodeActionsProvider(
		{
			language: 'xml',
			scheme: 'file',
			pattern: '**/*pom*.xml*'
		},
		new DependencyVersionCodeActionProvider(),
		{
			providedCodeActionKinds: [
				vscode.CodeActionKind.RefactorExtract
			]
		}
	);

	// 2. Register the Command that does the actual work
	const command = vscode.commands.registerCommand(EXTRACT_DEPENDENCY_VERSION.command, extractDependencyVersionCommand);

	context.subscriptions.push(codeAction, command);
}

// This method is called when your extension is deactivated
export function deactivate() {
	/**
	 * This method is empty.
	*/
}
