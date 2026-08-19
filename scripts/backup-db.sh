#!/bin/sh
# สำรองฐานข้อมูล MySQL ออกไปนอก docker volume — รันทุกวันผ่าน cron บน mini-PC
# ตัวอย่าง crontab: 0 3 * * * /path/to/repo/scripts/backup-db.sh >> /var/log/carrental-backup.log 2>&1
set -eu

BACKUP_DIR="${BACKUP_DIR:-$HOME/carrental-backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

docker exec carrental_mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  > "$BACKUP_DIR/car_company_${TIMESTAMP}.sql"

gzip "$BACKUP_DIR/car_company_${TIMESTAMP}.sql"

find "$BACKUP_DIR" -name 'car_company_*.sql.gz' -mtime "+${KEEP_DAYS}" -delete

echo "[backup-db] saved $BACKUP_DIR/car_company_${TIMESTAMP}.sql.gz"
