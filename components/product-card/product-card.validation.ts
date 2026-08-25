export function parseNonNegativeSafeInteger(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseOptionalNonNegativeSafeInteger(value: string) {
  return value === "" ? undefined : parseNonNegativeSafeInteger(value);
}

export function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function parseBorderRadius(value: string) {
  const parsed = parseNonNegativeSafeInteger(value);
  return parsed !== null && parsed <= 24 ? parsed : null;
}
