# Introduction to updating Go dependencies

A short description on how we manage vendor packages. We are using official
[Go dependency management tool](https://github.com/golang/dep) to manage dependencies
and `.gitignore` to ignore redundant files like tests etc.

# Step by step guide

1. Have the Dashboard source checked out in `${GOPATH}/src/github.com/kubernetes/dashboard`.
2. Have [Go dependency management tool](https://github.com/golang/dep) installed.
3. Create new branch.
4. Update dependency versions in `Gopkg.toml`.
5. Run `dep ensure && dep prune` to update `vendor` contents and keep only used files.
6. Try to build and run the unit tests. If they are broken most likely some of our vendor packages have
changed API and it needs to be fixed.
7. Commit the changes in `vendor` directory and in our sources separately for easier review.
8. Send a pull request.
