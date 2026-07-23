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

  local node_bin app_root
  node_bin="$(command -v node)"
  app_root="$(readlink -f "${CURRENT_LINK}")"

  if [ ! -d "${app_root}/.next" ] || [ ! -d "${app_root}/node_modules" ]; then
    log "ERROR: Release is missing .next or node_modules in ${app_root}"
    exit 1
  fi

  if command -v pm2 >/dev/null 2>&1; then
    pm2 delete zolv-stack 2>/dev/null || true
    sleep 2

    if [ -x "${app_root}/node_modules/next/dist/bin/next" ]; then
      log "Starting app with pm2 + next binary"
      NODE_ENV=production pm2 start "${app_root}/node_modules/next/dist/bin/next" \
        --name zolv-stack \
        --interpreter "${node_bin}" \
        --cwd "${app_root}" \
        -- start -p 3000 -H 0.0.0.0 || true
    fi

    if ! pm2 describe zolv-stack 2>/dev/null | grep -q "online"; then
      log "Next binary start did not stay online, trying pm2 + npm run start"
      pm2 delete zolv-stack 2>/dev/null || true
      NODE_ENV=production pm2 start npm \
        --name zolv-stack \
        --cwd "${app_root}" \
        -- run start || true
    fi

    if ! pm2 describe zolv-stack 2>/dev/null | grep -q "online"; then
      log "ERROR: pm2 process zolv-stack is not online"
      log_diagnostics
      exit 1
    fi

    pm2 save
    pm2 status zolv-stack || true
    return 0
  fi

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl restart zolv-stack
    return 0
  fi

  log "ERROR: Neither pm2 nor systemctl is available to restart the app"
  exit 1
}

health_urls() {
  printf '%s\n' \
    "${HEALTHCHECK_URL}" \
    "http://127.0.0.1:3000/api/health" \
    "http://localhost:3000/api/health" \
    "http://127.0.0.1:3000" \
    "http://localhost:3000"
}

wait_for_health() {
  local attempts="${1:-30}"
  local delay="${2:-2}"
  local attempt url

  for ((attempt = 1; attempt <= attempts; attempt++)); do
    while IFS= read -r url; do
      [ -n "${url}" ] || continue
      if curl -fsS "${url}" >/dev/null 2>&1; then
        log "Health check passed: ${url} (attempt ${attempt})"
        return 0
      fi
    done < <(health_urls | awk '!seen[$0]++')

    log "Health check attempt ${attempt}/${attempts} failed, retrying in ${delay}s..."
    sleep "${delay}"
  done

  log "ERROR: Health check failed for all URLs"
  while IFS= read -r url; do
    [ -n "${url}" ] || continue
    log "Trying verbose curl: ${url}"
    curl -v "${url}" 2>&1 | tail -n 20 || true
  done < <(health_urls | awk '!seen[$0]++')

  return 1
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

log_diagnostics() {
  log "HEALTHCHECK_URL=${HEALTHCHECK_URL}"
  log "=== pm2 status ==="
  pm2 status 2>/dev/null || true
  log "=== pm2 logs (last 40 lines) ==="
  pm2 logs zolv-stack --lines 40 --nostream 2>/dev/null || true
  log "=== port 3000 listeners ==="
  ss -tlnp 2>/dev/null | grep ':3000' || netstat -tlnp 2>/dev/null | grep ':3000' || true
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

log "Running health check"
if ! wait_for_health 30 2; then
  log "Healthcheck failed for ${SHA}"
  log_diagnostics
  if [ -n "${PREVIOUS_TARGET}" ] && [ -d "${PREVIOUS_TARGET}" ]; then
    log "Rolling back to ${PREVIOUS_TARGET}"
    ln -sfn "${PREVIOUS_TARGET}" "${CURRENT_LINK}"
    restart_app
    wait_for_health 15 2
  fi
  log_diagnostics
  exit 1
fi

# Cleanup old releases (keep latest 3)
log "Cleaning up old releases (keeping latest 3)..."

find "${APP_DIR}/releases" \
  -mindepth 1 -maxdepth 1 -type d \
  -printf '%T@ %p\n' |
sort -nr |
tail -n +4 |
cut -d' ' -f2- |
xargs -r rm -rf

log "Remaining releases:"
ls -1dt "${APP_DIR}/releases"/*

rm -f "${ARCHIVE_PATH}"
log "Deployment successful"
