#!/bin/sh

# use cloudcms-query-runner utility to run a query
# npm install cloudcms-util
# npx cloudcms-query-runner -g ../gitana.json import --branch master -graphql --query-file-path ./graphql-query-1.txt --print-results
# npx cloudcms-query-runner -g ../gitana.json --branch 7ce09ce6e8371cb0ed4b -graphql --query-file-path ./graphql-query-1.txt --print-results
npx cloudcms-query-runner --gitana-file-path '../gitana.json' --graphql --query-file-path './graphql-query-1.txt' --print-results --branch 7ce09ce6e8371cb0ed4b