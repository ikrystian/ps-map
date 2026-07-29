"use client"

import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  saleDate: string
  dueDate: string
  paymentDate: string | null
  netAmount: number
  vatRate: number
  vatAmount: number
  grossAmount: number
  status: string
  buyerName: string
  buyerNIP: string | null
  buyerAddress: string
  buyerPostalCode: string
  buyerCity: string
  buyerCountry: string
  ksefNumber?: string | null
  ksefStatus?: string | null
  order: {
    orderNumber: string
    orderType: string
    subscriptionPlan?: {
      nazwa: string
    }
  }
  lawFirm: {
    nazwa: string
    nip: string | null
    adres: string | null
    kodPocztowy: string | null
    miasto: string | null
    email: string | null
    telefon: string | null
  }
}

export default function InvoicePrintPage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch invoice")
        const data = await response.json()
        setInvoice(data)

        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
          window.print()
        }, 500)
      } catch (error) {
        console.error("Error fetching invoice:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Faktura nie została znaleziona</p>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        :global(.dark) {
          --background: 0 0% 100% !important;
          --foreground: 0 0% 0% !important;
          --card: 0 0% 100% !important;
          --card-foreground: 0 0% 0% !important;
        }

        :global(html), :global(body) {
          background-color: #f0efe9 !important;
          color: #1c1c1a !important;
          color-scheme: light !important;
        }

        @media print {
          :global(html), :global(body) {
            background-color: #ffffff !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }

        @page {
          size: A4;
          margin: 0;
        }

        .invoice-container {
          max-width: 21cm;
          margin: 0 auto;
          background: #ffffff;
          font-family: var(--font-poppins), Arial, sans-serif;
          color: #1c1c1a;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }

        @media print {
          .invoice-container {
            box-shadow: none;
          }
        }

        .invoice-body {
          padding: 1.4cm 1.3cm 1cm;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1cm 1.3cm 0.9cm;
          background: #141414;
          background-image: linear-gradient(135deg, #141414 0%, #1b2320 100%);
          border-bottom: 3px solid #d7b56d;
        }

        .invoice-logo {
          height: 30px;
          width: auto;
          display: block;
        }

        .invoice-title-block {
          margin-top: 14px;
        }

        .invoice-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
        }

        .invoice-number {
          font-size: 13px;
          color: #d7b56d;
          font-weight: 600;
          margin-top: 2px;
        }

        .company-info {
          text-align: right;
          color: #e5e5e0;
        }

        .company-name {
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 0.3rem;
          color: #ffffff;
        }

        .company-info div {
          font-size: 11px;
          line-height: 1.6;
          color: #b7b5a9;
        }

        .ksef-badge {
          display: inline-flex;
          flex-direction: column;
          margin-top: 12px;
          padding: 6px 10px;
          background: #d7b56d;
          border-radius: 8px;
          color: #141414;
        }

        .ksef-badge .label {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .ksef-badge .value {
          font-size: 10px;
          font-family: var(--font-geist-mono), monospace;
          margin-top: 1px;
        }

        .parties-section {
          display: flex;
          gap: 1.5rem;
          margin: 1.8rem 0;
        }

        .party {
          flex: 1;
          background: #faf9f5;
          border: 1px solid #e9e6dc;
          border-radius: 12px;
          padding: 1rem 1.1rem;
        }

        .party-title {
          font-weight: 700;
          font-size: 11px;
          margin-bottom: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #0da192;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .party-title::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d7b56d;
        }

        .party-details {
          font-size: 12px;
          line-height: 1.7;
          color: #3d3929;
        }

        .dates-section {
          display: flex;
          gap: 0.75rem;
          margin: 1.6rem 0;
          font-size: 11.5px;
        }

        .date-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: #f5f4ee;
          border: 1px solid #ebebe4;
          border-radius: 10px;
          padding: 0.5rem 0.9rem;
        }

        .date-label {
          font-weight: 700;
          color: #83827d;
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .items-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 1.6rem 0;
          font-size: 12px;
          border: 1px solid #e9e6dc;
          border-radius: 12px;
          overflow: hidden;
        }

        .items-table th,
        .items-table td {
          padding: 0.65rem 0.6rem;
          text-align: left;
        }

        .items-table th {
          background-color: #141414;
          color: #ffffff;
          font-weight: 600;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .items-table tbody td {
          border-top: 1px solid #ebebe4;
        }

        .items-table td.right,
        .items-table th.right {
          text-align: right;
        }

        .summary-section {
          margin-top: 1.4rem;
          display: flex;
          justify-content: flex-end;
        }

        .summary-table {
          width: 55%;
          font-size: 12px;
          background: #faf9f5;
          border: 1px solid #e9e6dc;
          border-radius: 12px;
          padding: 0.9rem 1.1rem;
        }

        .summary-table .row {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          color: #535146;
        }

        .summary-table .total {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 15px;
          border-top: 2px solid #d7b56d;
          padding-top: 0.6rem;
          margin-top: 0.4rem;
          color: #0c4539;
        }

        .footer-section {
          margin-top: 2rem;
          padding: 1cm 1.3cm;
          background: #141414;
          background-image: linear-gradient(135deg, #141414 0%, #1b2320 100%);
          color: #b7b5a9;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #2a2a26;
          padding-bottom: 0.8rem;
          margin-bottom: 0.8rem;
        }

        .footer-logo {
          height: 18px;
          width: auto;
          opacity: 0.95;
        }

        .footer-contact {
          font-size: 10.5px;
          color: #d7b56d;
          font-weight: 600;
          text-align: right;
          line-height: 1.6;
        }

        .footer-note {
          font-size: 10px;
          color: #83827d;
          line-height: 1.6;
        }

        .payment-info {
          margin-top: 1.6rem;
          padding: 1rem 1.1rem;
          background-color: rgba(13, 161, 146, 0.06);
          border: 1px solid rgba(13, 161, 146, 0.25);
          border-radius: 12px;
          font-size: 11.5px;
        }

        .payment-info .payment-title {
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0c4539;
        }
      `}</style>

      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div>
            <img src="/logo-color.svg" alt="Prosta Sprawa" className="invoice-logo" style={{ filter: "brightness(0) invert(1)" }} />
            <div className="invoice-title-block">
              <div className="invoice-title">Faktura VAT</div>
              <div className="invoice-number">{invoice.invoiceNumber}</div>
            </div>
            {invoice.ksefNumber && (
              <div className="ksef-badge">
                <span className="label">Faktura ustrukturyzowana (KSeF)</span>
                <span className="value">Numer KSeF: {invoice.ksefNumber}</span>
              </div>
            )}
          </div>
          <div className="company-info">
            <div className="company-name">Prosta Sprawa</div>
            <div>ul. Przykładowa 123</div>
            <div>00-001 Warszawa</div>
            <div>NIP: 1234567890</div>
          </div>
        </div>

        <div className="invoice-body">
          {/* Parties */}
          <div className="parties-section">
            <div className="party">
              <div className="party-title">Sprzedawca</div>
              <div className="party-details">
                <div style={{ fontWeight: 700 }}>Prosta Sprawa</div>
                <div>ul. Przykładowa 123</div>
                <div>00-001 Warszawa</div>
                <div>NIP: 1234567890</div>
                <div>Email: kontakt@prostasprawa.pl</div>
                <div>Tel: +48 123 456 789</div>
              </div>
            </div>
            <div className="party">
              <div className="party-title">Nabywca</div>
              <div className="party-details">
                <div style={{ fontWeight: 700 }}>{invoice.buyerName}</div>
                <div>{invoice.buyerAddress}</div>
                <div>{invoice.buyerPostalCode} {invoice.buyerCity}</div>
                {invoice.buyerNIP && <div>NIP: {invoice.buyerNIP}</div>}
                <div>{invoice.buyerCountry}</div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="dates-section">
            <div className="date-item">
              <span className="date-label">Data wystawienia</span>
              <span>{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Data sprzedaży</span>
              <span>{formatDate(invoice.saleDate)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Termin płatności</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>Lp.</th>
                <th style={{ width: "38%" }}>Nazwa towaru/usługi</th>
                <th className="right" style={{ width: "9%" }}>Ilość</th>
                <th style={{ width: "9%" }}>J.m.</th>
                <th className="right" style={{ width: "16%" }}>Cena netto</th>
                <th className="right" style={{ width: "8%" }}>VAT %</th>
                <th className="right" style={{ width: "15%" }}>Wartość brutto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="right">1</td>
                <td>
                  {invoice.order.orderType === "SUBSCRIPTION" ? (
                    <>
                      Subskrypcja:{" "}
                      {invoice.order.subscriptionPlan?.nazwa || "Pakiet subskrypcji"}
                    </>
                  ) : (
                    "Pakiet punktów"
                  )}
                  <br />
                  <span style={{ fontSize: "10px", color: "#83827d" }}>
                    Zamówienie: {invoice.order.orderNumber}
                  </span>
                </td>
                <td className="right">1</td>
                <td>szt.</td>
                <td className="right">{formatCurrency(invoice.netAmount)}</td>
                <td className="right">{invoice.vatRate}%</td>
                <td className="right">{formatCurrency(invoice.grossAmount)}</td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          <div className="summary-section">
            <div className="summary-table">
              <div className="row">
                <span>Razem netto:</span>
                <span>{formatCurrency(invoice.netAmount)}</span>
              </div>
              <div className="row">
                <span>VAT ({invoice.vatRate}%):</span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <div className="total">
                <span>Razem brutto:</span>
                <span>{formatCurrency(invoice.grossAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="payment-info">
            <div className="payment-title">Informacje o płatności</div>
            <div>Sposób płatności: Przelew bankowy</div>
            <div>Nr konta: 12 3456 7890 1234 5678 9012 3456</div>
            {invoice.paymentDate && (
              <div style={{ marginTop: "0.5rem", color: "#10b981", fontWeight: 700 }}>
                Faktura opłacona dnia: {formatDate(invoice.paymentDate)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="footer-section">
          <div className="footer-top">
            <img src="/logo-color.svg" alt="Prosta Sprawa" className="footer-logo" style={{ filter: "brightness(0) invert(1)" }} />
            <div className="footer-contact">
              kontakt@prostasprawa.pl<br />
              +48 123 456 789
            </div>
          </div>
          <div className="footer-note">
            Faktura wystawiona automatycznie przez system Prosta Sprawa.
            W przypadku pytań prosimy o kontakt: kontakt@prostasprawa.pl
          </div>
        </div>
      </div>

      {/* Print Button (visible only on screen) */}
      <div className="no-print" style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        display: "flex",
        gap: "1rem"
      }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0da192",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          Drukuj / Zapisz jako PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          Zamknij
        </button>
      </div>
    </>
  )
}
