module.exports = async ({ github, context, core }) => {
  const commitSha = process.env.GITHUB_SHA;
  const tag_name = process.env.GITHUB_REF_NAME;
  console.log("tag:", tag_name);

  let id, html_url, upload_url;

  try {
    // Get a release by tag name
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    const getRes = await github.rest.repos.getReleaseByTag({
      ...context.repo,
      tag: tag_name,
    });

    ({
      data: { id, html_url, upload_url },
    } = getRes);

    console.log("Existing release found:", { id, html_url, upload_url });
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }

    console.log("No existing release found. Creating a new draft...");

    // No existing release for this tag found so let's create a release
    // API Documentation: https://docs.github.com/en/rest/reference/repos#create-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/v18#repos-create-release
    const createReleaseRes = await github.rest.repos.createRelease({
      ...context.repo,
      tag_name,
      name: tag_name,
      body: "",
      draft: true,
      prerelease: tag_name.includes("-"),
      target_commitish: commitSha,
    });

    // Get the ID, html_url, and upload URL for the created Release from the response
    ({
      data: { id, html_url, upload_url },
    } = createReleaseRes);

    console.log("Created release:", { id, html_url, upload_url });
  }

  return { id, html_url, upload_url };
};
