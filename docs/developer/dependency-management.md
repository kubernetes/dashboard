# Dependency management

- Keep all the dependencies outside the repository.
- Avoid using suspicious, unknown dependencies as they may introduce vulnerabilities.

## Go dependencies

- Use [go mod](https://github.com/golang/go/wiki/Modules) as dependency manager.
- Run `go mod tidy` before sending any changes.
- Use only official releases, avoid using master versions.

## JavaScript dependencies

- Use [npm](https://www.npmjs.com/) as package manager.
- Run `npm ci` after checking out the repository to install dependencies.
- [Dependabot](https://github.com/dependabot) updates packages by creating pull requests for
the new releases of used packages. Its pull requests are marked with `area/dependency` label.
- Update `package-lock.json` before sending any changes.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
