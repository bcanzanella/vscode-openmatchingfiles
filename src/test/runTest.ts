//@ts-nocheck
import * as path from "path";
import { runTests } from "vscode-test";

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // The path to the extension test script
    // Passed to --extensionTestsPath
	// const extensionSingleRootTestsPath = path.resolve(__dirname, "./suite/index");
	// const extensionSingleRootTestsPath = path.resolve(__dirname, "./suite/index");

    // Download VS Code, unzip it and run the integration test
	await runTests({ extensionDevelopmentPath, extensionTestsPath: path.resolve(__dirname, "./suite/index.singleRoot"),
		launchArgs: ['./test-project', '--disable-extensions'] },
	);

	await runTests({ extensionDevelopmentPath, extensionTestsPath: path.resolve(__dirname, "./suite/index.multiRoot"),
		launchArgs: ['openmatchingfilestest.code-workspace', '--disable-extensions'] },
	);
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

main();
