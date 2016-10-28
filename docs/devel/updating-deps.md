# Introduction to updating godeps

A short description on how I managed to upgrade the vendor packages. There is no
guarantee that this is the easiest/best way to do this, but it is a way

# Step by step guide

- Have the dashboard source checked out in `${GOPATH}/src/github.com/kubernetes/dashboard`
- Install [govendor](https://github.com/kardianos/govendor)
- Create a branch
- Run `govendor update +vendor` to update all current packages
- Try to build and run the unit tests
- If they are broken most likely some of our vendor packages have changed API's
  or added dependencies themselves
- Run `govendor add <new dependencies>` to add the new dependencies and fix
  our code to use the updates API's
- Go back to the build and run the unit tests step until this succeeds
- Commit the changes in the vendor directory.
- Commit the changes to our sources. (For reviewability keep these two commits
  separate)
- Update this HOWTO :)
- Send a pull request
