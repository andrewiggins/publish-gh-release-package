# publish-gh-release-package

A repo to experiment with scripts to create a package from a release and publish it

## Steps to release

Below are the theoretical release steps a package using the pattern this repo
demonstrates would need follow to release & publish a package

> Prerequisite: Do whatever your package requires to bump the version in Git.
> That process might be creating and merging a PR that just bumps the version or
> completing an automatically generated `changesets` PR

1. Create tag for release at the commit that should be released:
   1. `git checkout main`
   2. `git tag v1.1.0`
   3. `git push --tags`
2. Wait for Release workflow to create the draft GitHub release and upload the
   NPM package artifact to the GitHub release
3. Download the NPM package from the release and publish it
   1. `npm publish package-1.1.0.tgz`
4. Fill out and publish the GitHub release
