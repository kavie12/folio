export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export const normalizeUsername = (v: string) => v.trim().toLowerCase().replace(/^@/, '');

export function validateUsername(v: string): string | null {
  return USERNAME_RE.test(normalizeUsername(v))
    ? null
    : 'Usernames are 3 to 20 characters: letters, numbers and underscores.';
}

export function validateDisplayName(v: string): string | null {
  const n = v.trim().length;
  return n >= 1 && n <= 40 ? null : 'Display names are 1 to 40 characters.';
}
