module.exports = ({ github, context, core }) => {
  // // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/v18#repos-upload-release-asset for more information
  // const headers = { 'content-type': assetContentType, 'content-length': contentLength(assetPath) };
  //
  // // Upload a release asset
  // // API Documentation: https://docs.github.com/en/rest/reference/repos#upload-a-release-asset
  // // Octokit Documentation: https://octokit.github.io/rest.js/v18#repos-upload-release-asset
  // const uploadAssetResponse = await github.repos.uploadReleaseAsset({
  //   url: uploadUrl,
  //   headers,
  //   name: assetName,
  //   file: fs.readFileSync(assetPath)
  // });
  //
  // // Get the browser_download_url for the uploaded release asset from the response
  // const {
  //   data: { browser_download_url: browserDownloadUrl }
  // } = uploadAssetResponse;
};
