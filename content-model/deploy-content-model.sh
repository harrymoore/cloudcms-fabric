#!/bin/sh

# build form fields from definition
# npx cloudcms-util create-form-fields --data-path ./ --qname fabric:category --overwrite

# use cloudcms-util import feature to upload a local copy of the content model to a cloud cms branch
# npm install cloudcms-util
npx cloudcms-util import -g ../gitana.json --branch d19ead4bc1bd4d4b3007 --all-definitions --folder-path .
# npx cloudcms-util import -g ../gitana.json --branch master               --all-definitions --folder-path .
