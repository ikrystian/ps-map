  Zmiany w projekcie:

  ┌───────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────┐
  │             Plik              │                                               Opis                                               │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ scripts/db-backup.sh          │ Backup SQLite z rotacją (30 dni). Używa sqlite3 .backup — bezpieczne przy aktywnych połączeniach │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ scripts/db-restore.sh         │ Przywraca z wybranego backupu; przed nadpisaniem tworzy zabezpieczenie aktualnego stanu          │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ scripts/migration-rollback.sh │ Rollback ostatniej migracji — przywraca najnowszy backup pre-deploy                              │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ scripts/setup-cron-backup.sh  │ Instaluje cron joby na serwerze (codziennie 02:00, co niedzielę 03:00)                           │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ .github/workflows/deploy.yml  │ Backup automatyczny przed każdym deployem; rollback bazy przy błędzie migracji                   │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ package.json                  │ Nowe komendy: db:backup, db:restore, db:rollback                                                 │
  └───────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────┘

  Użycie:

  # Ręczny backup
  bun run db:backup

  # Lista backupów / przywróć konkretny
  bun run db:restore                          # lista
  bun run db:restore backups/db/db_xxx.db    # przywróć

  # Rollback ostatniej migracji
  bun run db:rollback

  Na serwerze produkcyjnym (jednorazowo):
  ./scripts/setup-cron-backup.sh