#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Use provided argument or fallback to prompt
if [ -z "$1" ]; then
  read -p "Enter your Docker Hub Username: " USERNAME
else
  USERNAME=$1
fi

if [ -z "$USERNAME" ]; then
  echo "Username cannot be empty. Exiting."
  exit 1
fi

echo "=========================================="
echo " Starting Build and Push Process for $USERNAME"
echo "=========================================="

echo "Step 1: Logging into Docker Hub"
docker login

echo "=========================================="
echo "Step 2: Building Backend API Image"
docker build -t $USERNAME/event-booking-api:latest ./api

echo "=========================================="
echo "Step 3: Pushing Backend API Image "
docker push $USERNAME/event-booking-api:latest

echo "=========================================="
echo "Step 4: Building Frontend Web Image"
docker build -t $USERNAME/event-booking-web:latest ./client

echo "=========================================="
echo "Step 5: Pushing Frontend Web Image"
docker push $USERNAME/event-booking-web:latest

echo "=========================================="
echo " Success! Images have been built and pushed."
echo " Start the complete application stack with:"
echo " docker-compose pull"
echo " docker-compose up -d"
echo "=========================================="
