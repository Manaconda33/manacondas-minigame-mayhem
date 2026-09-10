export function requireValue<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Expected test value to exist');
  return value;
}
