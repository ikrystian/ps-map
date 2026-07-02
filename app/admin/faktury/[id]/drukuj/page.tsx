// Admin nie ma dostępu do /panel-eksperta (middleware przekierowuje role != LAW_FIRM),
// więc wydruk faktury dla admina żyje pod /admin/faktury/[id]/drukuj.
// API /api/invoices/[id] pozwala adminowi pobrać dowolną fakturę.
export { default } from "@/app/panel-eksperta/faktury/[id]/drukuj/page"
