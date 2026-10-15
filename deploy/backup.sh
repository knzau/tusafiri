#!/bin/bash
set -euo pipefail

root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
backup_dir=${BACKUP_DIR:-/var/backups/tusafiri}
mkdir -p "$backup_dir"

stamp=$(date -u +%Y-%m-%d)
target="$backup_dir/tusafiri-prod-$stamp.sql.gz"
tmp=$(mktemp "$backup_dir/.tusafiri-prod-$stamp.XXXXXX")

cleanup() {
  rm -f "$tmp"
}
trap cleanup EXIT

docker compose -f "$root/compose.prod.yaml" --env-file "$root/.env.prod" -p tusafiri-prod exec -T db \
  sh -c 'pg_dump --no-owner --username "$POSTGRES_USER" "$POSTGRES_DB"' | gzip -c > "$tmp"

mv "$tmp" "$target"
trap - EXIT
find "$backup_dir" -name 'tusafiri-prod-*.sql.gz' -mtime +7 -delete
