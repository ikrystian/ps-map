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
    nazwaFirmy: string | null
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
          background-color: #f3f4f6 !important;
          color: #000000 !important;
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
          margin: 1cm;
        }

        .invoice-container {
          max-width: 21cm;
          margin: 0 auto;
          padding: 1cm;
          background: white;
          font-family: Arial, sans-serif;
          color: #000;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #000;
        }

        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .invoice-number {
          font-size: 18px;
          color: #333;
        }

        .company-info {
          text-align: right;
        }

        .company-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 0.25rem;
        }

        .parties-section {
          display: flex;
          justify-content: space-between;
          margin: 2rem 0;
        }

        .party {
          flex: 1;
        }

        .party-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .party-details {
          font-size: 12px;
          line-height: 1.6;
        }

        .dates-section {
          display: flex;
          gap: 2rem;
          margin: 2rem 0;
          font-size: 12px;
        }

        .date-item {
          display: flex;
          gap: 0.5rem;
        }

        .date-label {
          font-weight: bold;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          font-size: 12px;
        }

        .items-table th,
        .items-table td {
          border: 1px solid #333;
          padding: 0.5rem;
          text-align: left;
        }

        .items-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }

        .items-table td.right {
          text-align: right;
        }

        .summary-section {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
        }

        .summary-table {
          width: 50%;
          font-size: 12px;
        }

        .summary-table tr {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
        }

        .summary-table .total {
          font-weight: bold;
          font-size: 14px;
          border-top: 2px solid #000;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
        }

        .footer-section {
          margin-top: 3rem;
          font-size: 11px;
          color: #666;
        }

        .payment-info {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          font-size: 11px;
        }
      `}</style>

      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div>
            <div className="invoice-title">FAKTURA VAT</div>
            <div className="invoice-number">{invoice.invoiceNumber}</div>
            {invoice.ksefNumber && (
              <div style={{ marginTop: "0.5rem", fontSize: "11px", color: "var(--primary)", fontWeight: "bold" }}>
                Faktura ustrukturyzowana (KSeF)
                <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#000", marginTop: "2px", fontWeight: "normal" }}>
                  Numer KSeF: {invoice.ksefNumber}
                </div>
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

        {/* Parties */}
        <div className="parties-section">
          <div className="party">
            <div className="party-title">Sprzedawca</div>
            <div className="party-details">
              <div className="company-name">Prosta Sprawa</div>
              <div>ul. Przykładowa 123</div>
              <div>00-001 Warszawa</div>
              <div>NIP: 1234567890</div>
              <div>Email: kontakt@prosta-sprawa.pl</div>
              <div>Tel: +48 123 456 789</div>
            </div>
          </div>
          <div className="party">
            <div className="party-title">Nabywca</div>
            <div className="party-details">
              <div className="company-name">{invoice.buyerName}</div>
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
            <span className="date-label">Data wystawienia:</span>
            <span>{formatDate(invoice.issueDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Data sprzedaży:</span>
            <span>{formatDate(invoice.saleDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Termin płatności:</span>
            <span>{formatDate(invoice.dueDate)}</span>
          </div>
        </div>

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: "5%" }}>Lp.</th>
              <th style={{ width: "40%" }}>Nazwa towaru/usługi</th>
              <th style={{ width: "10%" }}>Ilość</th>
              <th style={{ width: "10%" }}>J.m.</th>
              <th style={{ width: "15%" }}>Cena netto</th>
              <th style={{ width: "10%" }}>VAT %</th>
              <th style={{ width: "15%" }}>Wartość brutto</th>
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
                <span style={{ fontSize: "10px", color: "#666" }}>
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
            <div>
              <span>Razem netto:</span>
              <span>{formatCurrency(invoice.netAmount)}</span>
            </div>
            <div>
              <span>VAT ({invoice.vatRate}%):</span>
              <span>{formatCurrency(invoice.vatAmount)}</span>
            </div>
            <div className="total">
              <span>RAZEM BRUTTO:</span>
              <span>{formatCurrency(invoice.grossAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="payment-info">
          <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
            Informacje o płatności:
          </div>
          <div>Sposób płatności: Przelew bankowy</div>
          <div>Nr konta: 12 3456 7890 1234 5678 9012 3456</div>
          {invoice.paymentDate && (
            <div style={{ marginTop: "0.5rem", color: "#22c55e", fontWeight: "bold" }}>
              Faktura opłacona dnia: {formatDate(invoice.paymentDate)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer-section">
          <p>
            Faktura wystawiona automatycznie przez system Prosta Sprawa.
          </p>
          <p>
            W przypadku pytań prosimy o kontakt: kontakt@prosta-sprawa.pl
          </p>
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
            backgroundColor: "var(--primary)",
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
