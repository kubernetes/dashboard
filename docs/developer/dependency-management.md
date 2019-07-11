# Dependency management

- We keep all the dependencies outside the repository.
- Avoid using suspicious, unknown dependencies as they may introduce vulnerabilities.

## Go dependencies

- We use [go mod](https://github.com/golang/go/wiki/Modules) as dependency manager. 
- Remember to run `go mod tidy` before sending any changes.
- If it is possible use only official releases. Avoid using master versions.

## JavaScript dependencies

- We use [npm](https://www.npmjs.com/) as package manager.
- In order to start development you need to run `npm ci` after checking out the repository.
- [Greenkeeper](https://greenkeeper.io/) helps us to update packages by creating pull requests for
the new releases of packages that we use. Its pull requests are marked with `greenkeeper` label.
- Remember to update `package-lock.json` before sending any changes.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
