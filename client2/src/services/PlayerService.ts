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

// export function setUsername(username: string) {
//   const v = username.trim();
//   if (v.length >= 2 && v.length <= 20) {
//     localStorage.setItem('player_username', v);
//     return true;
//   }
//   return false;
// }

export function setUsername(username: string): boolean {
  const regex = /^[\p{L}0-9]{2,20}$/u;

  if (!regex.test(username.trim())) {
    return false;
  }
  localStorage.setItem('player_username', username.trim());
  return true;
}