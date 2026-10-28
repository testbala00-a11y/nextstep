/** Returns the phone as digits (with +country code if given), or null if invalid. Bare 10-digit numbers are Indian mobiles. */
export function normalizePhone(input: string) {
  const digits = input.replace(/[^\d+]/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^0[6-9]\d{9}$/.test(digits)) return `+91${digits.slice(1)}`;
  if (/^\+\d{10,15}$/.test(digits)) return digits;
  return null;
}
