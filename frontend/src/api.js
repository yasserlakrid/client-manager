const API_BASE = '/api';

export function getStoredAccount() {
  try {
    const raw = localStorage.getItem('aura_account');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeAccount(account) {
  localStorage.setItem('aura_account', JSON.stringify(account));
}

export function clearAccount() {
  localStorage.removeItem('aura_account');
}

export function authHeaders(account) {
  const acc = account || getStoredAccount();
  if (!acc) return {};
  return { 'X-Account-Id': acc.id };
}

export async function apiFetch(path, options = {}, account) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(account),
    ...options.headers,
  };
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  storeAccount(data);
  return data;
}

export async function signup(name, email, password, role) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  storeAccount(data);
  return data;
}

export async function logout() {
  clearAccount();
}
