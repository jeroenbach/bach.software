#!/usr/bin/env bash
# Download and extract the specified folder from the repository
curl -L "https://github.com/jeroenbach/bach.software/archive/refs/heads/main.zip" -o "bach.software-terraform.zip"
unzip -q "bach.software-terraform.zip" "bach.software-main/src/app/examples/post4/terraform/*"

# Move the extracted folder to current directory and remove the zip and extracted folder
mv "bach.software-main/src/app/examples/post4/terraform" "./terraform"
rm -rf "bach.software-terraform.zip" "bach.software-main"

# Navigate to the terraform directory
cd "./terraform"
