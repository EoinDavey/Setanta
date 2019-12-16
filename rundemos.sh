#!/bin/bash
for i in demos/*; do
    if ! time node node_build/cli.js $i > /dev/null; then
        exit 1;
    fi;
done;
