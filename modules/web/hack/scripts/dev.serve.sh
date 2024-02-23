#!/bin/sh

echo "Installing dependencies"
SKIP_POSTINSTALL=true yarn

echo "Starting angular in dev mode"
npx ng serve --proxy-config=proxy.conf.json --host=0.0.0.0 --disable-host-check --poll=2000
