const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});
export function persianDateParts(
  iso: string,
): { year: number; month: number; day: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== iso
  )
    return null;
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}
export function persianDateToISO(
  year: number,
  month: number,
  day: number,
): string | null {
  if (
    ![year, month, day].every(Number.isInteger) ||
    year < 1000 ||
    year > 2000 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (month <= 6 ? 31 : 30)
  )
    return null;
  let left = Math.floor(Date.UTC(year + 621, 0, 1) / 86400000),
    right = Math.floor(Date.UTC(year + 622, 11, 31) / 86400000);
  const target = year * 10000 + month * 100 + day;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2),
      iso = new Date(middle * 86400000).toISOString().slice(0, 10),
      parts = persianDateParts(iso)!;
    const actual = parts.year * 10000 + parts.month * 100 + parts.day;
    if (actual === target) return iso;
    if (actual < target) left = middle + 1;
    else right = middle - 1;
  }
  return null;
}
