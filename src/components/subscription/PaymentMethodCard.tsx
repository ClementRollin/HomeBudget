const CARD_BRAND_ICONS: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
  default: "💳",
};

type Props = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export default function PaymentMethodCard({ brand, last4, expMonth, expYear }: Props) {
  const icon = CARD_BRAND_ICONS[brand.toLowerCase()] ?? CARD_BRAND_ICONS.default;
  const brandLabel = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm text-slate-300 font-medium">
          {brandLabel} •••• {last4}
        </p>
        <p className="text-xs text-slate-500">
          Expire {String(expMonth).padStart(2, "0")}/{expYear}
        </p>
      </div>
    </div>
  );
}
