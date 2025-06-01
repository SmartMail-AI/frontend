interface ApplicationStorage {
  token: string;
}

export function getStoredValue(key: keyof ApplicationStorage) {
  return localStorage.getItem(key);
}

export function setStoredValue(key: keyof ApplicationStorage, value: ApplicationStorage[keyof ApplicationStorage]) {
  return localStorage.setItem(key, value);
}

export function saveToken(token: string) {
  return setStoredValue('token', token);
}

export function getStoredToken() {
  return getStoredValue('token');
}

export function isTokenStored() {
  return getStoredValue('token') !== null;
}
