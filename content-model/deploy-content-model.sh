#!/bin/sh

# build form fields from definition
# npx cloudcms-util create-form-fields --data-path ./ --qname fabric:category --overwrite

# use cloudcms-util import feature to upload a local copy of the content model to a cloud cms branch
# npm install cloudcms-util
npx cloudcms-util import -g ../gitana.json --branch 7ce09ce6e8371cb0ed4b --all-definitions --folder-path .
