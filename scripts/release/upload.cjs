/**
 * @typedef {import('@octokit/openapi-types').components["schemas"]["release"]} Release
 *
 * @typedef Params
 * @property {typeof require} require
 * @property {ReturnType<typeof import("@actions/github").getOctokit>} github
 * @property {typeof import("@actions/github").context} context
 * @property {typeof import("@actions/glob")} glob
 * @property {Release} release
 *
 * @param {Params} params
 */
async function upload({ require, github, context, glob, release }) {
  const fs = require("fs");
  const path = require("path");

  // Find artifact to upload
  const artifactRegex = /^publish-gh-release-package-.+\.tgz$/;
  const artifactPattern = "publish-gh-release-package-*.tgz";
  const globber = await glob.create(artifactPattern, {
    matchDirectories: false,
  });

  const results = await globber.glob();
  if (results.length < 0) {
    throw new Error(
      `No release artifact found matching pattern: ${artifactPattern}`
    );
  } else if (results.length > 1) {
    throw new Error(
      `More than one artifact matching pattern found. Expected only one. Found ${results.length}.`
    );
  }

  const assetName = results[0];
  const assetPath = path.join(process.cwd(), assetName);

  for (let asset of release.assets) {
    if (artifactRegex.test(asset.name)) {
      console.log(
        `Found existing asset matching asset pattern: ${asset.name}. Removing...`
      );
      await github.rest.repos.deleteReleaseAsset({
        ...context.repo,
        asset_id: asset.id,
      });
    }
  }

  console.log(
    `No asset with name ${assetName} found. Creating & uploading new one.`
  );
  console.log(`Uploading ${assetName} at ${assetPath}...`);

  // Upload a release asset
  // API Documentation: https://docs.github.com/en/rest/reference/repos#upload-a-release-asset
  // Octokit Documentation: https://octokit.github.io/rest.js/v18#repos-upload-release-asset
  const uploadAssetResponse = await github.rest.repos.uploadReleaseAsset({
    ...context.repo,
    release_id: release.id,
    name: assetName,
    data: fs.readFileSync(assetPath),
  });

  console.log("Asset:", uploadAssetResponse.data);
  return uploadAssetResponse.data;
}

module.exports = upload;
