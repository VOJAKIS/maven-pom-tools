import * as vscode from 'vscode';
import { EXTRACT_DEPENDENCY_VERSION } from './commands';

export class DependencyVersionCodeActionProvider implements vscode.CodeActionProvider {

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
		const text = document.getText();
		const cursorOffset = document.offsetAt(range.start);

		// Find nearest <dependency> boundaries around the cursor
		const dependencyStartOffset = text.lastIndexOf('<dependency>', cursorOffset);
		const dependencyEndOffset = text.indexOf('</dependency>', cursorOffset);
		const previousDependencyEndOffset = text.lastIndexOf('</dependency>', cursorOffset);

		// Rule: Must be inside <dependency>...</dependency>
		if (dependencyStartOffset === -1 || dependencyEndOffset === -1 || previousDependencyEndOffset > dependencyStartOffset) {
			return [];
		}

		const dependencyBlock = text.substring(dependencyStartOffset, dependencyEndOffset + 13);

		// Rule: Must contain <version>
		const versionMatch = new RegExp(/<version>([^<]+)<\/version>/).exec(dependencyBlock);
		if (!versionMatch) {
			return [];
		}

		const versionValue = versionMatch[1].trim();

		// Rule: Trimmed version value starts with "${" ? Hide action
		if (versionValue.startsWith('${')) {
			return [];
		}

		// Rule: Derive property name from <artifactId>
		const artifactIdMatch = new RegExp(/<artifactId>([^<]+)<\/artifactId>/).exec(dependencyBlock);
		if (!artifactIdMatch) {
			return [];
		}

		const artifactId = artifactIdMatch[1].trim();

		// Calculate exact range of the version value to replace it later
		const versionStartInDoc = dependencyStartOffset + dependencyBlock.indexOf(versionMatch[1]);
		const versionValueRange = new vscode.Range(
			document.positionAt(versionStartInDoc),
			document.positionAt(versionStartInDoc + versionMatch[1].length)
		);

		// Create the Code Action
		const action = new vscode.CodeAction(`Extract version to <properties>`, vscode.CodeActionKind.RefactorExtract);

		// Instead of directly editing, we trigger a command to handle UI dialogs
		action.command = {
			command: EXTRACT_DEPENDENCY_VERSION.command,
			title: EXTRACT_DEPENDENCY_VERSION.title,
			arguments: [document, artifactId, versionValue, versionValueRange]
		};

		return [action];
	}
}