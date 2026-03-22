export function formatMetricValue(value: number): string {
  if (!Number.isFinite(value)) return "-";
  
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      notation: "compact", // Converts 1500 to 1.5K
    }).format(value);
  }
  
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, ensurePercent = false): string {
  if (!Number.isFinite(value)) return "-";
  // Some values might already be in decimal format (0.15) or percentage format (15.0)
  // Typically change_percent from backend is e.g. 15.4 instead of 0.154 if it's explicitly "percent"
  // Assuming it's already multiplied by 100:
  let finalValue = value;
  if (!ensurePercent && (Math.abs(value) > 1 || value === 0)) {
    finalValue = value / 100;
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(finalValue);
}

export function formatScore(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}
