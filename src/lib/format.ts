export const formatCurrency = (value: number, locale = "fr-FR") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);

export const formatPercent = (
  value: number,
  locale = "fr-FR",
  maximumFractionDigits = 0,
) =>
  new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value);
