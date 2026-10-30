#!/bin/bash

echo "*** Run deploy of admin panel to AKS ***"
echo "*** Update manifest file, search and replace with image name and tag ***"
# update image name in workflow_manager manifest file.
# Uses a search and replace to add values from env instead
sed -i'' -e "s/__REGISTRY__/$REGISTRY_NAME/g ; s/__IMAGE__/$IMAGE_NAME/g ; s/__TAG__/$GITHUB_SHA/g ; s/__APP_NAME__/$APP_NAME/g" deployment/frontend-deployment.yml

echo "*** Updating frontend-deployment manifest ***"
kubectl apply -f deployment/frontend-deployment.yml
