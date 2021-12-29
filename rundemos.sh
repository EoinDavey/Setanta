#!/bin/bash
for i in demos/*.set; do
    f=${i##*/}
    if ! node node_build/cli.js $i < demos/inputs/${f//.set/.in} | diff - demos/outputs/${f//.set/.out}; then
        echo "$i failed";
        exit 1;
    fi;
done;
