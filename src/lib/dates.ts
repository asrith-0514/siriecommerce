export function dateKey(value = new Date()) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
export function formatDate(value: string | Date) {
  const legacy = typeof value === 'string' ? value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/) : null;
  const date = legacy ? new Date(Number(legacy[3]), Number(legacy[2]) - 1, Number(legacy[1])) : typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}