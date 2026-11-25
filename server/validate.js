export function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number(value);
}