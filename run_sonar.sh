#!/usr/bin/env bash

PROJECT_VERSION=`npm version | grep nen1878reader | awk -F\' '{print $2}'`

rm -rf coverage
rm -rf lib-cov

mkdir coverage

echo Running mocha
node-jscoverage lib lib-cov
mv lib lib-orig
mv lib-cov lib
mocha -R mocha-lcov-reporter > coverage/coverage.lcov
mocha -R xunit > coverage/TEST-all.xml
rm -rf lib
mv lib-orig lib

echo Running sonar-runner
sonar-runner -Dsonar.projectVersion=$PROJECT_VERSION
