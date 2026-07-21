#!/bin/bash
# Buduje aplikację do osobnego katalogu i podmienia go z .next atomowo (mv),
# żeby działający proces pm2 nigdy nie serwował z katalogu, który jest
# akurat nadpisywany przez `next build` (to powodowało błędy typu
# "Cannot find module middleware-manifest.json" i przestoje przy rebuildzie).
# Użycie: ./scripts/deploy.sh [pm2-app-name]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

PM2_APP="${1:-prosta-sprawa}"
LIVE_DIR=".next"
BUILD_DIR=".next-build"
OLD_DIR=".next-old"

echo "==> Czyszczenie poprzedniego katalogu tymczasowego ($BUILD_DIR)"
rm -rf "$BUILD_DIR"

echo "==> Zapisuję datę i godzinę deployu do .env"
DEPLOY_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
# Aktualizuj lub dodaj DEPLOY_TIME w .env
if grep -q "^DEPLOY_TIME=" .env 2>/dev/null; then
  sed -i "s|^DEPLOY_TIME=.*|DEPLOY_TIME=$DEPLOY_TIME|" .env
else
  echo "DEPLOY_TIME=$DEPLOY_TIME" >> .env
fi
echo "    DEPLOY_TIME=$DEPLOY_TIME"

echo "==> Build do $BUILD_DIR (żywa aplikacja nadal serwuje z $LIVE_DIR)"
NEXT_DIST_DIR="$BUILD_DIR" bun run build

if [ ! -f "$BUILD_DIR/server/middleware-manifest.json" ] && [ ! -f "$BUILD_DIR/BUILD_ID" ]; then
  echo "BŁĄD: build wygląda na niekompletny, przerywam przed podmianą." >&2
  exit 1
fi

echo "==> Migracje bazy danych"
bunx prisma generate
bunx prisma migrate deploy

echo "==> Atomowa podmiana katalogów builda"
rm -rf "$OLD_DIR"
if [ -d "$LIVE_DIR" ]; then
  mv "$LIVE_DIR" "$OLD_DIR"
fi
mv "$BUILD_DIR" "$LIVE_DIR"

echo "==> Reload pm2 ($PM2_APP)"
pm2 reload "$PM2_APP" --update-env

echo "==> Sprzątanie starego builda"
rm -rf "$OLD_DIR"

echo "==> Deploy zakończony"
