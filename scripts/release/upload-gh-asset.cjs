/**
 * @typedef {import('@octokit/openapi-types').components["schemas"]["release"]} Release
 *
 * @typedef Params
 * @property {typeof require} require GitHub Action Script's special require implementation
 * @property {ReturnType<typeof import("@actions/github").getOctokit>} github
 * @property {typeof import("@actions/github").context} context
 * @property {typeof import("@actions/glob")} glob
 * @property {Array<{ name: string; version: string }>} packages
 *
 * @param {Params} params
 */
async function upload({ require, github, context, glob, packages }) {
	const fs = require("fs");

	console.log("packages:", packages);
	if (packages.length > 1) {
		throw new Error(
			"This release script does not yet support handling multiple published packages"
		);
	}

	const preactPackage = packages.find(
		pkg => pkg.name == "publish-gh-release-package"
	);
	if (!preactPackage) {
		throw new Error(
			'Could not find a published package with name "publish-gh-release-package".'
		);
	}

	// Get matching GitHub release
	const releaseTag = `v${preactPackage.version}`;
	console.log(`Looking for release with tag ${releaseTag}...`);

	const response = await github.rest.repos.getReleaseByTag({
		...context.repo,
		tag: releaseTag
	});

	if (response.status >= 400) {
		const data = JSON.stringify(response.data, null, 2);
		throw new Error(
			`Github getReleaseByTag did not return success: ${response.status} ${data}`
		);
	}

	/** @type {Release} */
	const release = response.data;
	console.log("Found release:", release);

	// Find artifact to upload
	const artifactPattern = "publish-gh-release-package-*.tgz";
	const globber = await glob.create(artifactPattern, {
		matchDirectories: false
	});

	const results = await globber.glob();
	if (results.length == 0) {
		throw new Error(
			`No release artifact found matching pattern: ${artifactPattern}`
		);
	} else if (results.length > 1) {
		throw new Error(
			`More than one artifact matching pattern found. Expected only one. Found ${results.length}.`
		);
	}

	const assetPath = results[0];
	const assetName = `publish-gh-release-package-${release.tag_name.replace(
		/^v/,
		""
	)}.tgz`;
	const assetRegex = /^publish-gh-release-package-.+\.tgz$/;

	for (let asset of release.assets) {
		if (assetRegex.test(asset.name)) {
			console.log(
				`Found existing asset matching asset pattern: ${asset.name}. Removing...`
			);
			await github.rest.repos.deleteReleaseAsset({
				...context.repo,
				asset_id: asset.id
			});
		}
	}

	console.log(`Uploading ${assetName} from ${assetPath}...`);

	// Upload a release asset
	// API Documentation: https://docs.github.com/en/rest/reference/repos#upload-a-release-asset
	// Octokit Documentation: https://octokit.github.io/rest.js/v18#repos-upload-release-asset
	const uploadAssetResponse = await github.rest.repos.uploadReleaseAsset({
		...context.repo,
		release_id: release.id,
		name: assetName,
		// @ts-ignore
		data: fs.readFileSync(assetPath)
	});

	console.log("Asset:", uploadAssetResponse.data);
	return uploadAssetResponse.data;
}

module.exports = upload;
