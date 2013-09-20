#!/usr/bin/env bash

LINE_COUNT=`egrep ".{62}01" $1 | wc -l`
echo $LINE_COUNT
