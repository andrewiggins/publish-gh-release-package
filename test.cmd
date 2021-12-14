git br -D test-branch
git push --delete origin test-branch
git br test-branch
git push -u origin test-branch
git tag -d v0.0.1-test
git push --delete origin v0.0.1-test
git tag v0.0.1-test
git push --tags