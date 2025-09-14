#!/usr/bin/env bash
FOLDER="/src/app/examples/post4/terraform"
BRANCH="main"
REPO_NAME="bach.software"
OWNER="jeroenbach"

# Download and extract the specified folder from the repository
curl -L "https://github.com/$OWNER/$REPO_NAME/archive/refs/heads/$BRANCH.zip" -o "${REPO_NAME}-terraform.zip"
unzip -q "${REPO_NAME}-terraform.zip" "${REPO_NAME}-${BRANCH}/${FOLDER}/*"

# Move the extracted folder to current directory
mv "${REPO_NAME}-${BRANCH}/${FOLDER}" "./$(basename "$FOLDER")"
rm -rf "${REPO_NAME}-terraform.zip" "${REPO_NAME}-${BRANCH}"
