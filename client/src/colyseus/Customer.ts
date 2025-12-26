export function getOrCreateUID(): string {
  let uid = localStorage.getItem('player_uid');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('player_uid', uid);
  }
  return uid;
}

export function getUsername(): string | null {
  return localStorage.getItem('player_username');
}

export function isUsernameValid(username: string): boolean {
  const regex = /^[\p{L}0-9]{2,20}$/u;

  return (regex.test(username.trim()))
}

export function setUsername(username: string): void {
  localStorage.setItem('player_username', username.trim());
}