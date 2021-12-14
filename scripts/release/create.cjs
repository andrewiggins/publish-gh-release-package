module.exports = async ({ github, context, core }) => {
  const tag = process.env.GITHUB_REF_NAME;
  console.log("tag:", tag);

  // Get a release by tag name
  // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
  const getRes = await github.rest.repos.getReleaseByTag({
    ...context.repo,
    tag,
  });

  console.log(getRes);

  // // Create a release
  // // API Documentation: https://docs.github.com/en/rest/reference/repos#create-a-release
  // // Octokit Documentation: https://octokit.github.io/rest.js/v18#repos-create-release
  // const createReleaseResponse = await github.rest.repos.createRelease({
  //   ...context.repo,
  //   tag_name: tag,
  //   name: releaseName,
  //   body: bodyFileContent || body,
  //   draft,
  //   prerelease,
  //   target_commitish: commitish
  // });
  //
  // // Get the ID, html_url, and upload URL for the created Release from the response
  // const {
  //   data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl }
  // } = createReleaseResponse;
  //
  // // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/v18#repos-upload-release-asset for more information
  // const headers = { 'content-type': assetContentType, 'content-length': contentLength(assetPath) };
};
