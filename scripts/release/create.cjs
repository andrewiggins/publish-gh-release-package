/**
 * @typedef Params
 * @property {ReturnType<typeof import("@actions/github").getOctokit>} github
 * @property {typeof import("@actions/github").context} context
 * @property {any} core
 *
 * @param {Params} params
 * @returns
 */
async function create({ github, context, core }) {
  const commitSha = process.env.GITHUB_SHA;
  const tag_name = process.env.GITHUB_REF_NAME;
  console.log("tag:", tag_name);

  let releaseResult;

  let releasePages = github.paginate.iterator(
    github.rest.repos.listReleases,
    context.repo
  );

  for await (const page of releasePages) {
    for (let release of page.data) {
      if (release.tag_name == tag_name) {
        releaseResult = {
          id: release.id,
          html_url: release.html_url,
          upload_url: release.upload_url,
        };

        console.log("Existing release found:", releaseResult);
        break;
      }
    }
  }

  if (!releaseResult) {
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

    releaseResult = {
      id: createReleaseRes.data.id,
      html_url: createReleaseRes.data.html_url,
      upload_url: createReleaseRes.data.upload_url,
    };

    console.log("Created release:", releaseResult);
  }

  return releaseResult;
}

module.exports = create;
