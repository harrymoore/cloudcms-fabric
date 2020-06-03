#!/bin/sh

#
# Import Category/Sub-Category and Keyword default items
#

NOW=$(date +"%m-%d-%Y-%H-%M-%S")

GROUP=fabric
ARTIFACT=import
VERSION=$NOW

# https://fabric.cloudcms.net content repository
REPOSITORY_ID="8ba09e97a317becd199a"
# "Content Model Updates 1" branch
BRANCH_ID="85418f221a70809bf113"

npm install --no-audit

./cloudcms-login.sh

echo "*******************************"
echo "** create archive package file for import"
node ./app.js ./input-data/categories.json $GROUP $ARTIFACT $VERSION

echo "*******************************"
echo "** upload archive package"
cloudcms archive upload --group $GROUP --artifact $ARTIFACT --version $VERSION

echo "*******************************"
echo "** import archive package to branch"
cloudcms branch import --group $GROUP --artifact $ARTIFACT --version $VERSION --repository $REPOSITORY_ID --branch $BRANCH_ID

