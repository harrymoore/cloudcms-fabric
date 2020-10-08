#!/bin/sh

# build form fields from definition
# npx cloudcms-util create-form-fields --data-path ./ --qname fabric:category --overwrite

# use cloudcms-util import feature to upload a local copy of the content model to a cloud cms branch
# npm install cloudcms-util
# npx cloudcms-util import -g ../gitana-fabric.json --branch master --all-definitions --folder-path .
# npx cloudcms-util import -g ../gitana-harry.json --branch master --all-definitions --folder-path .
npx cloudcms-util import -g ../gitana-harry2.json --branch master --all-definitions --folder-path .
# npx cloudcms-util import -g ../gitana.json --branch 85418f221a70809bf113 --all-definitions --folder-path .
