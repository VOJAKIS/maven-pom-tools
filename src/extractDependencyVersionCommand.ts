import * as vscode from 'vscode';

export async function extractDependencyVersionCommand(
	document: vscode.TextDocument,
	artifactId: string,
	versionValue: string,
	versionValueRange: vscode.Range
) {
	const text = document.getText();
	const edit = new vscode.WorkspaceEdit();
	const uri = document.uri;

	let propertyName = `${artifactId}.version`;

	// Regex to find <properties> block
	const propertiesMatch = new RegExp(/<properties>([\s\S]*?)<\/properties>/).exec(text);

	// IF: Tag <properties> exists in pom.xml? (No)
	if (!propertiesMatch) {
		const dependenciesIndex = text.indexOf('<dependencies>');
		if (dependenciesIndex === -1) {
			vscode.window.showErrorMessage('Could not find <dependencies> tag in pom.xml');
			return;
		}

		const dependenciesPosition = document.positionAt(dependenciesIndex);
		const dependenciesLine = document.lineAt(dependenciesPosition.line);

		// DYNAMIC INDENTATION: Find exactly what whitespace is used before <dependencies>
		const baseIndent = dependenciesLine.text.substring(0, dependenciesLine.text.indexOf('<dependencies>'));
		// Assume inner indent is the same as base indent (e.g., 4 spaces), fallback to 4 spaces
		// const innerIndent = baseIndent.length > 0 ? baseIndent : '    ';

		// Create tag <properties> and place it above tag <dependencies>
		// Insert new tag at the end of <properties> with value as a version
		// const newPropertiesBlock = `<properties>\n\t\t<${propertyName}>${versionValue}</${propertyName}>\n\t</properties>\n\n\t`;
		const newPropertiesBlock = `<properties>\n${baseIndent}${baseIndent}<${propertyName}>${versionValue}</${propertyName}>\n${baseIndent}</properties>\n\n${baseIndent}`;
		edit.insert(uri, dependenciesPosition, newPropertiesBlock);

		// Change value in <version> tag to ${propertyName}
		edit.replace(uri, versionValueRange, `\${${propertyName}}`);

		await vscode.workspace.applyEdit(edit);
		return; // stop
	}

	// IF: Tag <properties> exists in pom.xml? (Yes)
	const propertiesBlock = propertiesMatch[0];
	const propertiesEndIndex = text.indexOf('</properties>');
	const propertiesEndPosition = document.positionAt(propertiesEndIndex);
	const propertiesEndLine = document.lineAt(propertiesEndPosition.line);

	// DYNAMIC INDENTATION: Find exactly what whitespace is used before </properties>
	const baseIndent = propertiesEndLine.text.substring(0, propertiesEndLine.text.indexOf('</properties>'));
	// const innerIndent = baseIndent.length > 0 ? baseIndent : '    ';


	// Regex to check if the specific property already exists
	// const propertyRegex = new RegExp(String.raw`<${propertyName}>\s*(.*?)\s*<\/${propertyName}>`);
	// const propertyRegex = new RegExp(`<${propertyName}>([^<]+)${propertyName}>`);
	const propertyRegex = new RegExp(String.raw`<${propertyName}>\s*([^<]+)\s*<\/${propertyName}>`);
	const existingPropertyMatch = new RegExp(propertyRegex).exec(propertiesBlock);

	// IF: Property with this name already exists?
	if (!existingPropertyMatch) {
		// Property with this name does NOT exist
		// Insert new tag at the end of <properties> with value as a version
		const newPropertyTag = `${baseIndent}<${propertyName}>${versionValue}</${propertyName}>\n${baseIndent}`;
		edit.insert(uri, propertiesEndPosition, newPropertyTag);

		// Change value in <version> tag
		edit.replace(uri, versionValueRange, `\${${propertyName}}`);
		await vscode.workspace.applyEdit(edit);
		return;
	}

	const existingVersion = existingPropertyMatch[1].trim();

	// Show dialog to user
	const changeToExistingLabel = 'Change to existing property';
	const enterNewNameLabel = 'Enter a new name';

	const choice = await vscode.window.showQuickPick([
		{ label: changeToExistingLabel, description: `Use version ${existingVersion}` },
		{ label: enterNewNameLabel, description: `Dependency has version ${versionValue}` }
	], {
		placeHolder: `Property "${propertyName}" already exists (Properties: ${existingVersion} | Dependency: ${versionValue})`
	});

	if (!choice) {
		return; // User cancelled
	}

	console.log(`Choice label: ${choice.label}`);
	switch (choice.label) {
		case changeToExistingLabel: {
			// Keep existing property, just replace <version>
			edit.replace(uri, versionValueRange, `\${${propertyName}}`);
			await vscode.workspace.applyEdit(edit);
			return;
		}

		case enterNewNameLabel: {
			const dotVersionIndex = propertyName.lastIndexOf('.version');
			// Enter a new name (with old one inputted)

			const newName = await vscode.window.showInputBox({
				title: `Enter a new property name`,
				prompt: 'Enter a new property name',
				value: propertyName,
				// Cursor before .version
				valueSelection: [dotVersionIndex, dotVersionIndex],
			});

			if (!newName) {
				return; // User cancelled
			}

			if (newName === propertyName) {
				vscode.window.showWarningMessage(`Property tag with name '${propertyName}' already exists!`);
			}

			propertyName = newName;

			// Insert new tag at the end of <properties>
			edit.insert(uri, propertiesEndPosition, `${baseIndent}<${propertyName}>${versionValue}</${propertyName}>\n${baseIndent}`);

			// Change value in <version> tag
			edit.replace(uri, versionValueRange, `\${${propertyName}}`);
			await vscode.workspace.applyEdit(edit);
			return; // stop
		}

		default: {
			vscode.window.showErrorMessage('No choice matched, this should not happen!');
			return;
		}
	}
}