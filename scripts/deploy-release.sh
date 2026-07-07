#!/usr/bin/env bash
set -eo pipefail

log() {
  echo "[deploy] $*"
}

log "starting deploy-release.sh"

SHA="${SHA:?SHA is required}"
DEPLOY_USER="${USER:-ubuntu}"
DEPLOY_HOME="${HOME:-/home/${DEPLOY_USER}}"
APP_DIR="${APP_DIR:-${DEPLOY_HOME}/zolv-stack}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/api/health}"
RELEASE_DIR="${APP_DIR}/releases/${SHA}"
CURRENT_LINK="${APP_DIR}/current"
PREVIOUS_TARGET=""

find_archive() {
  local candidate
  for candidate in \
    "/tmp/zolv-stack-${SHA}.tgz" \
    "/tmp/zolv-stack-${SHA}/zolv-stack-${SHA}.tgz"; do
    if [ -f "${candidate}" ]; then
      echo "${candidate}"
      return 0
    fi
  done

  find /tmp -maxdepth 2 -type f -name "zolv-stack-${SHA}.tgz" | head -n 1
}

ensure_app_dir() {
  if [ -d "${APP_DIR}" ] && [ -w "${APP_DIR}" ]; then
    mkdir -p "${APP_DIR}/releases"
    return 0
  fi

  if mkdir -p "${APP_DIR}/releases" 2>/dev/null; then
    return 0
  fi

  log "ERROR: APP_DIR is not writable: ${APP_DIR}"
  log "Run once on the server:"
  log "  sudo mkdir -p ${APP_DIR}/releases"
  log "  sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${APP_DIR}"
  log "Or set LIGHTSAIL_APP_DIR to a writable path, e.g. ${DEPLOY_HOME}/zolv-stack"
  exit 1
}

restart_app() {
  setup_node_path

  if command -v pm2 >/dev/null 2>&1; then
    if pm2 describe zolv-stack >/dev/null 2>&1; then
      pm2 delete zolv-stack
    fi
    pm2 start node_modules/next/dist/bin/next \
      --name zolv-stack \
      --cwd "${CURRENT_LINK}" \
      -- start -p 3000
    pm2 save
    return 0
  fi

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl restart zolv-stack
    return 0
  fi

  log "ERROR: Neither pm2 nor systemctl is available to restart the app"
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "ERROR: Required command not found: $1"
    log "PATH=${PATH}"
    exit 1
  fi
}

setup_node_path() {
  export PATH="/usr/local/bin:/usr/bin:/bin:${DEPLOY_HOME}/.local/bin:${PATH}"

  export NVM_DIR="${NVM_DIR:-${DEPLOY_HOME}/.nvm}"
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "${NVM_DIR}/nvm.sh"
    nvm use --silent default 2>/dev/null || nvm use --silent --lts 2>/dev/null || true
  fi

  for profile in "${DEPLOY_HOME}/.profile" "${DEPLOY_HOME}/.bashrc"; do
    if ! command -v node >/dev/null 2>&1 && [ -f "${profile}" ]; then
      # shellcheck disable=SC1090
      . "${profile}"
    fi
  done

  if ! command -v node >/dev/null 2>&1; then
    for candidate in \
      "${DEPLOY_HOME}/.nvm/versions/node/"*/bin \
      /usr/local/bin \
      /usr/bin; do
      if [ -d "${candidate}" ] && [ -x "${candidate}/node" ]; then
        export PATH="${candidate}:${PATH}"
        break
      fi
    done
  fi

  log "node=$(command -v node || echo missing) npm=$(command -v npm || echo missing) pm2=$(command -v pm2 || echo missing)"
}

setup_node_path

ARCHIVE_PATH="$(find_archive || true)"
log "user=$(whoami) home=${DEPLOY_HOME} app_dir=${APP_DIR}"
log "archive=${ARCHIVE_PATH:-not found}"

if [ -z "${ARCHIVE_PATH}" ] || [ ! -f "${ARCHIVE_PATH}" ]; then
  log "ERROR: Deployment artifact not found for ${SHA}"
  log "Contents of /tmp:"
  ls -la /tmp || true
  exit 1
fi

require_command tar
require_command node
require_command curl

ensure_app_dir

if [ -L "${CURRENT_LINK}" ]; then
  PREVIOUS_TARGET="$(readlink -f "${CURRENT_LINK}")"
fi

log "Deploying commit ${SHA}"
rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"
tar -xzf "${ARCHIVE_PATH}" -C "${RELEASE_DIR}"

cd "${RELEASE_DIR}"
if [ ! -d ".next" ] || [ ! -d "node_modules" ]; then
  log "ERROR: Prebuilt artifact is missing .next or node_modules"
  log "The app must be built in CI before deployment."
  exit 1
fi
log "Using prebuilt artifact from CI (skipping npm ci/build on server)"

ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"
log "Restarting application"
restart_app

log "Running health check: ${HEALTHCHECK_URL}"
if ! curl -fsS --retry 5 --retry-delay 2 "${HEALTHCHECK_URL}" >/dev/null; then
  log "Healthcheck failed for ${SHA}"
  if [ -n "${PREVIOUS_TARGET}" ] && [ -d "${PREVIOUS_TARGET}" ]; then
    log "Rolling back to ${PREVIOUS_TARGET}"
    ln -sfn "${PREVIOUS_TARGET}" "${CURRENT_LINK}"
    restart_app
    curl -fsS --retry 5 --retry-delay 2 "${HEALTHCHECK_URL}" >/dev/null
  fi
  exit 1
fi

rm -f "${ARCHIVE_PATH}"
log "Deployment successful"
