// AMORA — local accounts. Passwords are hashed with PBKDF2-SHA256 (WebCrypto, random salt); each account's data lives in its own
// localStorage namespace on this device. There is no server: accounts exist per browser/device, and the Full backup file carries
// an account's data between devices. NOTE: the password gates access to the app; it does not encrypt data stored in the browser.
import { Store } from './store.js';
import { uid } from './util.js';

const ITER = 150000;
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export const USERNAME_RE = /^[a-z0-9][a-z0-9_.-]{2,23}$/;
export const cryptoOk = () => !!(globalThis.crypto && crypto.subtle && crypto.getRandomValues);

async function derive(password, salt, iter = ITER) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, key, 256));
}
const safeEq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

const accounts = () => Store.getGlobal('accounts', []) || [];
const saveAccounts = (list) => Store.setGlobal('accounts', list);
const prefixOf = (id) => `u.${id}.`;
const norm = (u) => String(u || '').trim().toLowerCase();

const fails = {}; // in-memory throttle per username
function throttle(name) {
  const f = fails[name];
  if (f && f.until > Date.now()) return Math.ceil((f.until - Date.now()) / 1000);
  return 0;
}

export const Auth = {
  list: () => accounts().map((a) => ({ id: a.id, username: a.username, display: a.display, created: a.created, lastLogin: a.lastLogin })),
  hasAccounts: () => accounts().length > 0,
  hasLegacyData: () => Store.legacyKeys().length > 0,
  current: null,

  validate(username, password) {
    const u = norm(username);
    if (!USERNAME_RE.test(u)) return 'Usernames are 3–24 characters: letters, numbers, dot, dash or underscore.';
    if (String(password || '').length < 8) return 'Choose a password with at least 8 characters.';
    return '';
  },

  async register(username, password, { keep = false, display = '', adoptLegacy = false } = {}) {
    if (!cryptoOk()) throw new Error('Secure storage needs HTTPS (or localhost). Open the site over https:// to create an account.');
    const err = this.validate(username, password); if (err) throw new Error(err);
    const u = norm(username), list = accounts();
    if (list.some((a) => a.username === u)) throw new Error('That username is already taken on this device.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const acct = { id: uid('a'), username: u, display: (display || username).trim().slice(0, 30), salt: b64(salt), iter: ITER, hash: await derive(password, salt), created: Date.now(), lastLogin: Date.now() };
    list.push(acct); saveAccounts(list);
    if (adoptLegacy) for (const k of Store.legacyKeys()) { try { localStorage.setItem(Store.ROOT + prefixOf(acct.id) + k.slice(Store.ROOT.length), localStorage.getItem(k)); } catch { /* quota */ } }
    return this._start(acct, keep);
  },

  async login(username, password, { keep = false } = {}) {
    if (!cryptoOk()) throw new Error('Secure storage needs HTTPS (or localhost).');
    const u = norm(username), wait = throttle(u);
    if (wait) throw new Error(`Too many attempts. Try again in ${wait}s.`);
    const acct = accounts().find((a) => a.username === u);
    // Always run the KDF so unknown users and wrong passwords take similar time.
    const h = await derive(String(password || ''), acct ? unb64(acct.salt) : new Uint8Array(16), acct?.iter || ITER);
    if (!acct || !safeEq(h, acct.hash)) {
      const f = (fails[u] ||= { n: 0, until: 0 }); f.n++; if (f.n >= 5) { f.until = Date.now() + Math.min(300, 15 * 2 ** (f.n - 5)) * 1000; }
      throw new Error('Incorrect username or password.');
    }
    delete fails[u];
    const list = accounts(); const i = list.findIndex((a) => a.id === acct.id); list[i].lastLogin = Date.now(); saveAccounts(list);
    return this._start(list[i], keep);
  },

  _start(acct, keep) {
    Store.setNamespace(prefixOf(acct.id));
    this.current = { id: acct.id, username: acct.username, display: acct.display };
    this._remember(acct.id, keep);
    return this.current;
  },
  _remember(id, keep) {
    try { sessionStorage.removeItem(Store.ROOT + 'session'); } catch { /* ignore */ }
    Store.removeGlobal('session');
    if (keep) Store.setGlobal('session', { id }); else { try { sessionStorage.setItem(Store.ROOT + 'session', JSON.stringify({ id })); } catch { /* ignore */ } }
  },

  /** Resume a remembered session (same tab or "keep me signed in"). */
  resume() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem(Store.ROOT + 'session') || 'null'); } catch { /* ignore */ }
    s ||= Store.getGlobal('session', null);
    const acct = s && accounts().find((a) => a.id === s.id);
    if (!acct) return null;
    Store.setNamespace(prefixOf(acct.id));
    this.current = { id: acct.id, username: acct.username, display: acct.display };
    return this.current;
  },

  logout() {
    try { sessionStorage.removeItem(Store.ROOT + 'session'); } catch { /* ignore */ }
    Store.removeGlobal('session'); Store.setNamespace(null); this.current = null;
  },

  async verify(password) {
    const acct = accounts().find((a) => a.id === this.current?.id); if (!acct) return false;
    return safeEq(await derive(String(password || ''), unb64(acct.salt), acct.iter), acct.hash);
  },

  async changePassword(oldPw, newPw) {
    if (!(await this.verify(oldPw))) throw new Error('Your current password is not correct.');
    if (String(newPw).length < 8) throw new Error('Choose a new password with at least 8 characters.');
    const list = accounts(), a = list.find((x) => x.id === this.current.id), salt = crypto.getRandomValues(new Uint8Array(16));
    a.salt = b64(salt); a.iter = ITER; a.hash = await derive(newPw, salt); saveAccounts(list);
  },

  setDisplay(name) {
    const list = accounts(), a = list.find((x) => x.id === this.current.id); if (!a) return;
    a.display = String(name || a.username).trim().slice(0, 30); saveAccounts(list); this.current.display = a.display;
  },

  async deleteAccount(password) {
    if (!(await this.verify(password))) throw new Error('Password is not correct.');
    const id = this.current.id;
    Store.rawKeys(Store.ROOT + prefixOf(id)).forEach((k) => localStorage.removeItem(k));
    saveAccounts(accounts().filter((a) => a.id !== id));
    this.logout();
  },
};
