import beforeEach from "./helpers/beforeEach";
import child from "child_process";
import { cliPath } from "./fixtures";
import getCurrCommitHash from "./helpers/getCurrCommitHash";
import getCurrTagHash from "./helpers/getCurrTagHash";
import getCurrTree from "./helpers/getCurrTree";
import getCurrVersionExpoAndNative from "./helpers/getCurrVersionExpoAndNative";
import tempInitAndVersion from "./helpers/tempInitAndVersion";
import test from "ava";

test("CLI (Expo + bare native)", async t => {
	t.context.testProject = "expo-bare-project";
	beforeEach(t);
	delete process.env.npm_lifecycle_event;
	tempInitAndVersion();

	const versionProcess = child.spawnSync(
		cliPath,
		["--expo-and-bare-native"],
		{
			env: Object.assign({}, process.env, {
				RNV_ENV: "ava"
			})
		}
	);

	if (versionProcess.status > 0) {
		throw new Error(versionProcess.stderr.toString());
	}

	const expectedVersion = {
		appVersion: "2.0.1",
		buildNumber: "2",
		expoVersionCode: 2,
		CFBundleShortVersionString: {
			AwesomeProject: "2.0.1",
			"AwesomeProject-tvOS": "2.0.1",
			"AwesomeProject-tvOSTests": "2.0.1",
			AwesomeProjectTests: "2.0.1"
		},
		CFBundleVersion: {
			AwesomeProject: "2",
			"AwesomeProject-tvOS": "2",
			"AwesomeProject-tvOSTests": "2",
			AwesomeProjectTests: "2"
		},
		CURRENT_PROJECT_VERSION: "2",
		version: "2.0.1",
		versionCode: "2",
		versionName: "2.0.1"
	};

	const expectedTree = {
		head: ["package.json"],
		index: [
			"android/app/build.gradle",
			"app.json",
			"ios/AwesomeProject-tvOS/Info.plist",
			"ios/AwesomeProject-tvOSTests/Info.plist",
			"ios/AwesomeProject.xcodeproj/project.pbxproj",
			"ios/AwesomeProject/Info.plist",
			"ios/AwesomeProjectTests/Info.plist"
		]
	};

	const actualTree = await getCurrTree(t);
	actualTree.head.sort();
	actualTree.index.sort();
	expectedTree.head.sort();
	expectedTree.index.sort();

	t.plan(3);
	t.deepEqual(getCurrVersionExpoAndNative(t), expectedVersion);
	t.deepEqual(actualTree, expectedTree);
	t.is(await getCurrTagHash(t), await getCurrCommitHash(t));
});
