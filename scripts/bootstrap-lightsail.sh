#!/usr/bin/env bash
set -euo pipefail

# One-time server setup for zolv-stack deploys.
# Run on your Lightsail instance via SSH:
#   curl -fsSL <raw-url> | bash
# or:
#   bash scripts/bootstrap-lightsail.sh

APP_DIR="${1:-/var/www/zolv-stack}"
DEPLOY_USER="${2:-$(whoami)}"

echo "Setting up deploy directory: ${APP_DIR}"
echo "Deploy user: ${DEPLOY_USER}"

sudo mkdir -p "${APP_DIR}/releases"
sudo chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Install Node LTS before deploying."
  echo "Recommended:"
  echo "  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
  echo "  sudo apt-get install -y nodejs"
  echo "Or with nvm:"
  echo "  nvm install --lts && nvm alias default 'lts/*'"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Reinstall Node.js LTS (npm is included)."
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing pm2..."
  npm install -g pm2
fi

echo "Node: $(command -v node) ($(node -v))"
echo "npm:  $(command -v npm) ($(npm -v))"

echo "Bootstrap complete."
echo "Set GitHub secret LIGHTSAIL_APP_DIR=${APP_DIR}"
