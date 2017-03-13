#!/usr/bin/env bash

# Variables.
COVERAGE_REPORT_FILE=./coverage/go.txt

# Install packages that are dependencies of the test. Do not run the test. Improves performance.
go test -i github.com/kubernetes/dashboard/src/app/backend/...

# Create coverage report file.
set -e
[ -e ${COVERAGE_REPORT_FILE} ] && rm ${COVERAGE_REPORT_FILE}
mkdir -p "$(dirname ${COVERAGE_REPORT_FILE})" && touch ${COVERAGE_REPORT_FILE}

# Run coverage tests of all project packages. Parameter -race was removed to improve performance.
for d in $(go list github.com/kubernetes/dashboard/... | grep -v vendor); do
    go test -coverprofile=profile.out -covermode=atomic $d
    if [ -f profile.out ]; then
        cat profile.out >> ${COVERAGE_REPORT_FILE}
        rm profile.out
    fi
done
