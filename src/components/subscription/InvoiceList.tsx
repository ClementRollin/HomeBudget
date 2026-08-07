import type Stripe from "stripe";

type Invoice = {
  id: string;
  number: string | null;
  created: number;
  amountPaid: number;
  currency: string;
  status: string | null;
  pdfUrl: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Payée",
  open: "En attente",
  void: "Annulée",
  uncollectible: "Non recouvrée",
  draft: "Brouillon",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "text-emerald-400",
  open: "text-amber-400",
  void: "text-slate-400",
  uncollectible: "text-rose-400",
  draft: "text-slate-500",
};

function formatAmount(amountCents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-2">
        Aucune facture disponible.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {invoices.map((inv) => {
        const date = new Date(inv.created * 1000).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const status = inv.status ?? "unknown";
        const statusLabel = STATUS_LABELS[status] ?? status;
        const statusColor = STATUS_COLORS[status] ?? "text-slate-400";

        return (
          <div key={inv.id} className="flex items-center justify-between py-3 text-sm">
            <div className="space-y-0.5">
              <p className="text-slate-300">{inv.number ?? inv.id.slice(0, 8)}</p>
              <p className="text-xs text-slate-500">{date}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300 font-medium">
                {formatAmount(inv.amountPaid, inv.currency)}
              </span>
              <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
              {inv.pdfUrl && (
                <a
                  href={inv.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2"
                >
                  PDF
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function mapStripeInvoice(inv: Stripe.Invoice): Invoice {
  return {
    id: inv.id ?? "",
    number: inv.number,
    created: inv.created,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    status: inv.status,
    pdfUrl: inv.invoice_pdf ?? null,
  };
}
