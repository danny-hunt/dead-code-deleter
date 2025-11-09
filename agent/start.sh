#!/bin/bash

# Dead Code Deleter Agent Startup Script
# This script starts the agent service with proper environment setup

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables if .env file exists
if [ -f .env ]; then
  echo "Loading environment variables from .env"
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults if not provided
export PLATFORM_URL=${PLATFORM_URL:-"http://localhost:3001"}
export PROJECT_ID=${PROJECT_ID:-"exampleapp"}
export POLL_INTERVAL=${POLL_INTERVAL:-"5000"}
export EXAMPLEAPP_PATH=${EXAMPLEAPP_PATH:-"../exampleapp"}
export WORKSPACE_ROOT=${WORKSPACE_ROOT:-".."}

echo "=================================="
echo "Dead Code Deleter Agent"
echo "=================================="
echo "Platform URL: $PLATFORM_URL"
echo "Project ID: $PROJECT_ID"
echo "Poll Interval: ${POLL_INTERVAL}ms"
echo "Exampleapp Path: $EXAMPLEAPP_PATH"
echo "Workspace Root: $WORKSPACE_ROOT"
echo "=================================="
echo ""

# Check if cursor-agent is available
if ! command -v cursor-agent &> /dev/null; then
  echo "ERROR: cursor-agent is not installed or not in PATH"
  echo "Please install cursor-agent: https://www.cursor.com"
  exit 1
fi

# Check if gh (GitHub CLI) is available
if ! command -v gh &> /dev/null; then
  echo "ERROR: GitHub CLI (gh) is not installed or not in PATH"
  echo "Please install gh: https://cli.github.com/"
  exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
  echo "ERROR: GitHub CLI is not authenticated"
  echo "Please run: gh auth login"
  exit 1
fi

# Build if dist doesn't exist
if [ ! -d "dist" ]; then
  echo "Building agent..."
  npm run build
fi

# Start the agent
echo "Starting agent..."
npm start

