/**
 * Moduł kompatybilności wstecznej dla Google Drive -> Google Cloud Storage.
 * Wszystkie operacje tworzenia, listowania i przywracania kopii zapasowych
 * są teraz realizowane przez Google Cloud Storage (@/lib/gcs-backup).
 */
export * from "./gcs-backup"
