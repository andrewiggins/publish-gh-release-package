import fs from "fs";
import { fetch, stream } from "undici";
import sade from "sade";

let DEBUG = false;
const log = {
  debug: (...msgs) => DEBUG && console.log(...msgs),
};

/**
 * @param {string} linkHeader
 * @returns {Array<[string, string]>}
 */
function parseLinkHeader(linkHeader) {
  log.debug("raw link:", linkHeader);

  /** @type {Array<[string, string]>} */
  const result = [];
  const uris = linkHeader.split(/,\s*</);

  // Link header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link
  // We assume each link uri only has one param and the param key is "rel"
  for (let uri of uris) {
    // The first "<" may get stripped off by the split call above
    const match = uri.match(/<?([^>]*)>\s*;\s*rel="?([^"]*)"?/);

    // 1st group: URI, 2nd group: rel name
    result.push([match[2], match[1]]);
  }

  log.debug("parsed:", result);
  return result;
}

/**
 * @typedef {import('@octokit/openapi-types').components["schemas"]["release"]} Release
 * @returns {AsyncGenerator<Release[]>}
 */
async function* getReleases() {
  let nextUrl =
    "https://api.github.com/repos/andrewiggins/publish-gh-release-package/releases";
  while (nextUrl) {
    log.debug("Fetching", nextUrl);

    const response = await fetch(nextUrl);
    const linkHeader = response.headers.get("Link");
    const links = linkHeader ? parseLinkHeader(linkHeader) : null;

    nextUrl = links?.find((link) => link[0] == "next")?.[1];
    yield /** @type {Release[]} */ (await response.json());
  }
}

async function main(tag, opts) {
  DEBUG = opts.debug;

  // 1. Find a release with the matching tag
  /** @type {Release} */
  let release;

  for await (let releasePage of getReleases()) {
    release = releasePage.find((release) => release.tag_name == tag);
    if (release) {
      break;
    }
  }

  log.debug("Release:", release);
  if (release) {
    console.log("Found release", release.id, "at", release.html_url);
  } else {
    console.error(
      `Could not find a release with the tag ${tag}. Please publish that tag first, then run this script.`
    );
    process.exit(1);
  }

  // 2. Download npm package from release
  /** @type {Release["assets"][0]} */
  let packageAsset = null;
  const artifactRegex = /^publish-gh-release-package-.+\.tgz$/;
  for (let asset of release.assets) {
    if (artifactRegex.test(asset.name)) {
      packageAsset = asset;
    }
  }

  if (packageAsset) {
    console.log(
      `Found npm package asset: ${packageAsset.name}`,
      `\nDownloading ${packageAsset.name}...`
    );

    await stream(
      "https://github.com/andrewiggins/publish-gh-release-package/releases/download/v0.0.1-test/publish-gh-release-package-0.0.1.tgz",
      {
        method: "GET",
        maxRedirections: 30,
      },
      () => fs.createWriteStream("publish-gh-release-package-0.0.1.tgz")
    );
  } else {
    console.error(
      "Could not find asset matching package regex:",
      artifactRegex,
      "\nPlease wait for release workflow to complete and upload npm package."
    );
    process.exit(1);
  }

  // 3. Run npm publish
  // TODO: For now, manually run npm publish on package
}

sade("publish <tag>", true)
  .describe("Publish a tagged version of this package.")
  .option("--debug -d", "Log debugging information", false)
  .action(main)
  .parse(process.argv);
