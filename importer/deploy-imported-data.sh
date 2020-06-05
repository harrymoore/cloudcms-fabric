#!/bin/sh

#
# Import Category/Sub-Category and Keyword default items
#

NOW=$(date +"%m-%d-%Y-%H-%M-%S")

GROUP=fabric
ARTIFACT=import-content
VERSION=$NOW

# https://fabric.cloudcms.net content repository
REPOSITORY_ID="8ba09e97a317becd199a"
BRANCH_ID="master"

npm install --no-audit

./cloudcms-login.sh

echo "*******************************"
echo "** create archive package file for import"
# node ./app-download-images.js "./input-data/Wyng_-_fabric-com-blog.ghost.2020-01-07(3).json"
node ./app-import.js "./input-data/Wyng_-_fabric-com-blog.ghost.2020-01-07(3).json" $GROUP $ARTIFACT $VERSION

echo "*******************************"
echo "** upload archive package"
cloudcms archive upload --group $GROUP --artifact $ARTIFACT --version $VERSION

echo "*******************************"
echo "** import archive package to branch"
cloudcms branch import --group $GROUP --artifact $ARTIFACT --version $VERSION --repository $REPOSITORY_ID --branch $BRANCH_ID

