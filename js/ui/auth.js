// AMORA — sign in / create account screen.
import { h, $ } from '../core/util.js';
import { Auth } from '../core/auth.js';

/** Resolves to { created: boolean } once the user is signed in. */
export function authScreen() {
  return new Promise((resolve) => {
    let mode = Auth.hasAccounts() ? 'login' : 'register';
    const legacy = Auth.hasLegacyData();
    const root = h('div', { class: 'auth', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Sign in' });
    document.body.append(root);

    function draw(msg = '') {
      root.innerHTML = '';
      const user = h('input', { type: 'text', autocomplete: 'username', autocapitalize: 'none', spellcheck: 'false', placeholder: 'username', 'aria-label': 'Username', maxlength: 24 });
      const pass = h('input', { type: 'password', autocomplete: mode === 'login' ? 'current-password' : 'new-password', placeholder: 'password', 'aria-label': 'Password' });
      const pass2 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'repeat password', 'aria-label': 'Repeat password' });
      const disp = h('input', { type: 'text', placeholder: 'what should she call you? (optional)', 'aria-label': 'Display name', maxlength: 30 });
      const keep = h('input', { type: 'checkbox', id: 'keep', checked: true });
      const adult = h('input', { type: 'checkbox', id: 'adult18' });
      const adopt = h('input', { type: 'checkbox', id: 'adopt', checked: true });
      const err = h('div', { class: 'auth-err', role: 'alert' }, msg);
      const go = h('button', { class: 'btn primary wide', type: 'submit' }, mode === 'login' ? 'Sign in' : 'Create my account');
      const showPw = h('button', { type: 'button', class: 'link', onclick: () => { const t = pass.type === 'password' ? 'text' : 'password'; pass.type = t; if (mode !== 'login') pass2.type = t; showPw.textContent = t === 'text' ? 'Hide password' : 'Show password'; } }, 'Show password');
      const form = h('form', { class: 'auth-form', novalidate: true },
        h('label', { class: 'field' }, h('span', { class: 'label' }, 'Username'), user),
        mode === 'register' && h('label', { class: 'field' }, h('span', { class: 'label' }, 'Your name'), disp),
        h('label', { class: 'field' }, h('span', { class: 'label' }, 'Password'), pass),
        mode === 'register' && h('label', { class: 'field' }, h('span', { class: 'label' }, 'Repeat password'), pass2),
        h('div', { class: 'row between' }, showPw, mode === 'login' && h('label', { class: 'check' }, keep, h('span', 'Keep me signed in'))),
        mode === 'register' && h('label', { class: 'check' }, keep, h('span', 'Keep me signed in on this device')),
        mode === 'register' && legacy && h('label', { class: 'check' }, adopt, h('span', 'Move the companion & chats already saved in this browser into my account')),
        mode === 'register' && h('label', { class: 'check' }, adult, h('span', 'I am 18 or older. AMORA is for adults only.')),
        err, go,
        h('p', { class: 'muted small' }, mode === 'register'
          ? 'Accounts live on this device. Your data is saved under your account here, and you can move it to another device with a backup file. Your password is hashed — we can’t recover it, so keep it safe.'
          : 'Accounts live on this device. Moving to a new device? Create an account there and restore your backup in Settings.'));
      form.addEventListener('submit', async (e) => {
        e.preventDefault(); err.textContent = '';
        try {
          go.disabled = true; go.textContent = 'One moment…';
          if (mode === 'register') {
            if (pass.value !== pass2.value) throw new Error('The two passwords don’t match.');
            if (!adult.checked) throw new Error('Please confirm you are 18 or older.');
            await Auth.register(user.value, pass.value, { keep: keep.checked, display: disp.value, adoptLegacy: legacy && adopt.checked });
          } else await Auth.login(user.value, pass.value, { keep: keep.checked });
          root.classList.add('out'); setTimeout(() => root.remove(), 400);
          resolve({ created: mode === 'register', adopted: mode === 'register' && legacy && adopt.checked });
        } catch (ex) { err.textContent = ex.message || String(ex); go.disabled = false; go.textContent = mode === 'login' ? 'Sign in' : 'Create my account'; (mode === 'login' ? pass : /password|match/i.test(err.textContent) ? pass : user).focus(); }
      });
      root.append(h('div', { class: 'auth-card' },
        h('div', { class: 'logo' }, 'AMORA'),
        h('p', { class: 'muted', style: { margin: '0 0 14px' } }, mode === 'login' ? 'Welcome back.' : 'Create your private account.'),
        h('div', { class: 'tabs auth-tabs', role: 'tablist' },
          h('button', { type: 'button', role: 'tab', class: mode === 'login' ? 'on' : '', onclick: () => { mode = 'login'; draw(); } }, 'Sign in'),
          h('button', { type: 'button', role: 'tab', class: mode === 'register' ? 'on' : '', onclick: () => { mode = 'register'; draw(); } }, 'Create account')),
        form));
      setTimeout(() => user.focus(), 50);
    }
    draw();
  });
}
