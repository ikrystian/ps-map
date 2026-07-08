import LegalPageEditor from "@/components/admin/LegalPageEditor"

export default function AdminPolitykaPrywatnosciPage() {
  return (
    <LegalPageEditor
      slug="polityka-prywatnosci"
      pageName="Polityka prywatności"
      publicPath="/polityka-prywatnosci"
      showLastUpdated
    />
  )
}
