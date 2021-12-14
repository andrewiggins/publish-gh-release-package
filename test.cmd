rem Testing branch creation
@REM git br -D test-branch
@REM git push --delete origin test-branch
@REM git br test-branch
@REM git push -u origin test-branch

rem Testing tag creation
git tag -d v0.0.1-test
git push --delete origin v0.0.1-test
git tag v0.0.1-test
git push --tags