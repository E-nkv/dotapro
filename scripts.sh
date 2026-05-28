#!/usr/bin/env bash
# Dotapro VPS management scripts — run on the VPS as the deploy user

set -euo pipefail

VPS_DIR="/opt/dotapro"
DB_PATH="/opt/dotapro/data/dotapro.db"

# ── Colors ───────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# ── Logs ────────────────────────────────────────────────────────────────────

logs-api() {
  sudo journalctl -u dotapro-api --no-pager -n 50
}

logs-api-f() {
  sudo journalctl -u dotapro-api --no-pager -f
}

logs-scraper() {
  sudo journalctl -u dotapro-scraper --no-pager -n 50
}

logs-scraper-f() {
  sudo journalctl -u dotapro-scraper --no-pager -f
}

logs-caddy() {
  sudo journalctl -u caddy --no-pager -n 50
}

logs-caddy-f() {
  sudo journalctl -u caddy --no-pager -f
}

# ── Status ───────────────────────────────────────────────────────────────────

status() {
  echo ""
  echo "=== dotapro-api ==="
  sudo systemctl status dotapro-api --no-pager -l || true
  echo ""
  echo "=== dotapro-scraper.timer ==="
  sudo systemctl status dotapro-scraper.timer --no-pager -l || true
  echo ""
  echo "=== Next scraper run ==="
  sudo systemctl list-timers dotapro-scraper.timer --no-pager || true
  echo ""
  echo "=== caddy ==="
  sudo systemctl status caddy --no-pager -l || true
  echo ""
  echo "=== DB size ==="
  ls -lh "$DB_PATH" 2>/dev/null || warn "DB not found at $DB_PATH"
}

# ── System info ───────────────────────────────────────────────────────────────

sysinfo() {
  echo "=== Uptime ==="      && uptime
  echo "" && echo "=== Memory ===" && free -h
  echo "" && echo "=== Disk ==="   && df -h "$VPS_DIR"
  echo "" && echo "=== DB ==="     && ls -lh "$DB_PATH" 2>/dev/null || warn "DB not found"
}

# ── Restart ──────────────────────────────────────────────────────────────────

restart-api() {
  sudo systemctl restart dotapro-api
  sleep 1
  sudo systemctl status dotapro-api --no-pager -l | head -10
}

restart-caddy() {
  sudo systemctl reload caddy
  info "Caddy reloaded"
}

# ── Trigger scraper ─────────────────────────────────────────────────────────

scrape-now() {
  info "Triggering scraper (one-shot)..."
  sudo systemctl start dotapro-scraper
}

# ── Database ─────────────────────────────────────────────────────────────────

db-tables() {
  sqlite3 "$DB_PATH" ".tables"
}

db-stats() {
  echo "matches  : $(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM matches;')"
  echo "series   : $(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM series;')"
  echo "players  : $(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM players;')"
  echo "leagues  : $(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM leagues;')"
  echo "teams    : $(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM teams;')"
}

db-migrations() {
  sqlite3 "$DB_PATH" "SELECT * FROM schema_migrations;"
}

# ── API health ────────────────────────────────────────────────────────────────

health() {
  local domain="${1:-api.dotapro.org}"
  info "Testing https://$domain/ ..."
  curl -s --max-time 5 "https://$domain/" || echo ""
}

# ── Usage ─────────────────────────────────────────────────────────────────────

usage() {
  cat << EOF
Dotapro VPS management

Usage: ./scripts.sh <command>

Commands:
  logs-api         API logs (last 50 lines)
  logs-api-f       API logs (follow mode)
  logs-scraper     Scraper logs (last 50 lines)
  logs-scraper-f   Scraper logs (follow mode)
  logs-caddy       Caddy logs (last 50 lines)
  logs-caddy-f     Caddy logs (follow mode)
  status           All services status + next scraper run
  sysinfo          CPU, RAM, disk, DB size
  restart-api      Restart the API
  restart-caddy    Reload Caddy config
  scrape-now       Trigger scraper one-shot run
  db-tables        List DB tables
  db-stats         Row counts for all tables
  db-migrations    Migration version state
  health [domain]  Test API health (default: api.dotapro.org)
  help             Show this help

EOF
}

case "${1:-help}" in
  logs-api)        logs-api ;;
  logs-api-f)      logs-api-f ;;
  logs-scraper)    logs-scraper ;;
  logs-scraper-f)  logs-scraper-f ;;
  logs-caddy)      logs-caddy ;;
  logs-caddy-f)    logs-caddy-f ;;
  status)          status ;;
  sysinfo)         sysinfo ;;
  restart-api)     restart-api ;;
  restart-caddy)   restart-caddy ;;
  scrape-now)      scrape-now ;;
  db-tables)       db-tables ;;
  db-stats)        db-stats ;;
  db-migrations)   db-migrations ;;
  health)          health "${2:-}" ;;
  help|--help|-h)  usage ;;
  *)               error "Unknown command: $1"; usage; exit 1 ;;
esac
