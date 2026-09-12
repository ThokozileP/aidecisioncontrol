/** Minimal RFC 4180 CSV serialization — avoids pulling in a CSV library for one export route. */
export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escapeField = (value: string | number | null | undefined): string => {
    const text = value === null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeField).join(','));
  return lines.join('\r\n');
}
