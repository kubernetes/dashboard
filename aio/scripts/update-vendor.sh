#!/usr/bin/env bash

TMP_DIR="${TMP_DIR:-$(mktemp -d /tmp/update-vendor.XXXX)}"

echo "vendor: running 'go mod tidy'"
go mod tidy -v

echo "vendor: running 'go mod vendor'"
go mod vendor

# sort recorded packages for a given vendored dependency in modules.txt.
# `go mod vendor` outputs in imported order, which means slight go changes (or different platforms) can result in a differently ordered modules.txt.
# scan                 | prefix comment lines with the module name       | sort field 1  | strip leading text on comment lines
awk '{if($1=="#") print $2 " " $0; else print}' < vendor/modules.txt | sort -k1,1 -s | sed 's/.*#/#/' > "${TMP_DIR}/modules.txt.tmp"
mv "${TMP_DIR}/modules.txt.tmp" vendor/modules.txt

echo "Vendor Updated"