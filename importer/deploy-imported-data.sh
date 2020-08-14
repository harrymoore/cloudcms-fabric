#!/bin/sh

#
# Import Category/Sub-Category and Keyword default items AND Project and Image content
#

NOW=$(date +"%m-%d-%Y-%H-%M-%S")

GROUP=fabric
ARTIFACT=import-content
VERSION=$NOW

# https://fabric.cloudcms.net content repository
REPOSITORY_ID="8ba09e97a317becd199a"

# https://harry.cloudcms.net content repository
# REPOSITORY_ID="12360cd88adb6e461d56"

BRANCH_ID="master"

npm install --no-audit

./cloudcms-login.sh

echo "*******************************"
echo "** create archive package file for import"
# uncomment the following line to download images
# node ./app-download-images.js "./input-data/Wyng_-_fabric-com-blog.ghost.2020-01-07(3).json"
node ./app-import.js "./input-data/Wyng_-_fabric-com-blog.ghost.2020-01-07(3).json" $GROUP $ARTIFACT $VERSION

echo "*******************************"
echo "** upload archive package"
cloudcms archive upload --group $GROUP --artifact $ARTIFACT --version $VERSION

echo "*******************************"
echo "** import archive package to branch"
sleep 60
echo cloudcms branch import --group $GROUP --artifact $ARTIFACT --version $VERSION --repository $REPOSITORY_ID --branch $BRANCH_ID
# cloudcms branch import --group $GROUP --artifact $ARTIFACT --version $VERSION --repository $REPOSITORY_ID --branch $BRANCH_ID

echo "*******************************"
echo "** patch imported nodes to make sure they have a project id set (using the node's id)"
# uncomment one of the following lines to run the patch
# node ./post-import-patch.js -g ../gitana-harry.json --branch master
node ./post-import-patch.js -g ../gitana-fabric.json --branch master
