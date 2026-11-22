// AMORA — settings dashboard: appearance, backgrounds, chat behavior, data, install, about.
import { h, pickFile, readText, resizeImage } from '../core/util.js';
import { Store, defaultSettings } from '../core/store.js';
import { OPTIONS } from '../data/presets.js';
import { fSelect, fSwatches, fSlider, fToggle, fChips, section, toast, confirmBox, icon, modal } from './dom.js';
import { Auth } from '../core/auth.js';
import { exportBackup, importBackup, parseFile, exportThreadsJSON } from '../core/io.js';

const BG = [['rose-dusk', 'Rose dusk'], ['sakura', 'Sakura'], ['champagne', 'Champagne'], ['lavender', 'Lavender'], ['ocean', 'Ocean'], ['forest', 'Forest'], ['midnight', 'Midnight'], ['plain', 'Plain']];
const PATTERNS = [['none', 'None'], ['hearts', 'Hearts'], ['stars', 'Stars'], ['dots', 'Dots']];
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(2) + ' MB' : Math.round(n / 1024) + ' KB');

export function render(A) {
  const s = () => A.settings;
  const apply = () => { A.applyTheme(); A.save('settings'); };
  const root = h('div', { class: 'view' }), page = h('div', { class: 'page' });

  const pwModal = (title, fields, okLabel, onOk, danger) => {
    const inputs = fields.map(([label, ac]) => h('input', { type: 'password', autocomplete: ac, 'aria-label': label }));
    const err = h('div', { class: 'auth-err', role: 'alert' });
    modal({ title, size: 'sm', body: h('div', fields.map(([label], i) => h('label', { class: 'field' }, h('span', { class: 'label' }, label), inputs[i])), err),
      actions: [{ label: 'Cancel' }, { label: okLabel, kind: danger ? 'danger' : 'primary', keepOpen: true, onClick: async (close) => { try { await onOk(inputs.map((x) => x.value)); close(); } catch (e) { err.textContent = e.message; return false; } } }] });
  };
  const acct = h('div');
  const paintAcct = () => {
    acct.innerHTML = '';
    const me = Auth.current || { username: '—', display: '' };
    const dn = h('input', { type: 'text', value: me.display || '', maxlength: 30, 'aria-label': 'Display name' });
    dn.addEventListener('change', () => { Auth.setDisplay(dn.value); toast('Name updated'); });
    acct.append(h('p', { class: 'muted', style: { marginTop: 0 } }, 'Signed in as ', h('b', '@' + me.username), '. Your companions, chats, memories, journal and settings are saved under this account on this device.'),
      h('label', { class: 'field' }, h('span', { class: 'label' }, 'Display name'), dn),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn', onclick: () => pwModal('Change password', [['Current password', 'current-password'], ['New password (8+ characters)', 'new-password'], ['Repeat new password', 'new-password']], 'Change password', async ([o, n, n2]) => { if (n !== n2) throw new Error('The new passwords don’t match.'); await Auth.changePassword(o, n); toast('Password changed'); }) }, icon('lock', 16), 'Change password'),
        h('button', { class: 'btn', onclick: () => { A.flush(); exportBackup(A); } }, icon('download', 16), 'Download my data'),
        h('button', { class: 'btn', onclick: () => A.logout() }, icon('back', 16), 'Sign out'),
        h('button', { class: 'btn danger', onclick: () => pwModal('Delete account', [['Enter your password to confirm', 'current-password']], 'Delete account permanently', async ([pw]) => { await Auth.deleteAccount(pw); location.hash = ''; location.reload(); }, true) }, icon('trash', 16), 'Delete account')),
      h('small', { class: 'muted', style: { display: 'block', marginTop: '10px' } }, 'Accounts are stored on this device. To use yours elsewhere, download your data here, then create an account on the other device and use “Restore backup”. Your password protects access to the app; it does not encrypt browser storage.'));
  };
  paintAcct();
  const bgBox = h('div');
  const paintBg = () => {
    bgBox.innerHTML = '';
    const b = s().bg;
    bgBox.append(h('div', { class: 'bg-grid' }, BG.map(([id, nm]) => h('button', { class: `bg-tile${b.kind === 'preset' && b.preset === id ? ' on' : ''}`, style: { '--bgv': `var(--bg-${id})` }, onclick: () => { b.kind = 'preset'; b.preset = id; apply(); paintBg(); } }, nm)), h('button', { class: `bg-tile${b.kind === 'image' ? ' on' : ''}`, style: { '--bgv': b.image ? `url(${b.image}) center/cover` : 'var(--surface-2)' }, onclick: async () => { const f = await pickFile('image/*'); if (!f) return; try { b.image = await resizeImage(f, 1280, 0.8); b.kind = 'image'; apply(); paintBg(); } catch (e) { toast(e.message, 'err'); } } }, icon('upload', 16), ' Your image')),
      fChips('Pattern overlay', PATTERNS, () => b.pattern, (v) => { b.pattern = v; apply(); }),
      b.kind === 'image' && h('div', fSlider('Image blur', '', () => b.blur, (v) => { b.blur = v; apply(); }, { min: 0, max: 20, fmt: (v) => v + 'px' }), fSlider('Image dimming', 'Keeps text readable over bright photos.', () => b.dim, (v) => { b.dim = v; apply(); }, { fmt: (v) => v + '%' }), h('button', { class: 'btn ghost', onclick: () => { b.kind = 'preset'; b.image = null; apply(); paintBg(); } }, 'Remove image')));
  };
  paintBg();
  const usage = h('span', kb(Store.usage()));
  const install = h('div');
  const paintInstall = () => { install.innerHTML = ''; const standalone = matchMedia('(display-mode: standalone)').matches; install.append(h('p', { class: 'muted', style: { marginTop: 0 } }, standalone ? 'AMORA is installed on this device and works offline.' : A.installPrompt ? 'Install AMORA for a full-screen app that works offline.' : 'Use your browser’s “Install app” / “Add to Home Screen” option to install AMORA. Once loaded, it works offline.'), A.installPrompt && h('button', { class: 'btn primary', onclick: async () => { A.installPrompt.prompt(); await A.installPrompt.userChoice; A.installPrompt = null; paintInstall(); } }, icon('download', 16), 'Install app')); };
  paintInstall(); A.bus.on('install', paintInstall);

  page.append(h('div', { class: 'view-head' }, h('div', h('h2', 'Settings'), h('p', 'Account, appearance, chat behavior and your data.'))),
    section('Account', acct),
    section('Appearance',
      fChips('Theme', [['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']], () => s().theme, (v) => { s().theme = v; apply(); }),
      fSwatches('Accent color', OPTIONS.accents, () => s().accent, (v) => { s().accent = v; apply(); }),
      fChips('Typeface', [['serif', 'Elegant serif'], ['sans', 'Clean sans'], ['rounded', 'Soft rounded']], () => s().font, (v) => { s().font = v; apply(); }),
      fSlider('Text size', '', () => s().fontScale, (v) => { s().fontScale = v; apply(); }, { min: 85, max: 130, step: 5, fmt: (v) => v + '%' }),
      fChips('Message bubbles', [['soft', 'Soft'], ['glass', 'Glass'], ['solid', 'Solid']], () => s().bubbleStyle, (v) => { s().bubbleStyle = v; apply(); }),
      fToggle('Reduce motion', 'Disable animations and transitions.', () => s().chat.reducedMotion, (v) => { s().chat.reducedMotion = v; apply(); })),
    section('Chat background', bgBox),
    section('Chat behavior',
      fSlider('Typing speed', 'How long she “types” before each message. 0 = instant.', () => s().chat.typingSpeed, (v) => { s().chat.typingSpeed = v; A.save('settings'); }, { fmt: (v) => (v === 0 ? 'Instant' : v < 35 ? 'Fast' : v < 70 ? 'Natural' : 'Slow') }),
      fToggle('Typing indicator', 'Show animated dots while she writes.', () => s().chat.showTyping, (v) => { s().chat.showTyping = v; A.save('settings'); }),
      fToggle('Split long replies into several bubbles', '', () => s().chat.splitMessages, (v) => { s().chat.splitMessages = v; A.save('settings'); }),
      fToggle('Timestamps', '', () => s().chat.showTimestamps, (v) => { s().chat.showTimestamps = v; A.save('settings'); }),
      fToggle('Enter sends message', 'Off: Enter adds a new line (use the send button).', () => s().chat.enterToSend, (v) => { s().chat.enterToSend = v; A.save('settings'); }),
      fToggle('Conversation-starter chips', 'Suggestions above the message box.', () => s().chat.suggestions, (v) => { s().chat.suggestions = v; A.save('settings'); A.chat?.refreshSuggestions(); }),
      fToggle('Daily message', 'She greets you with something new once a day.', () => s().chat.dailyMessage, (v) => { s().chat.dailyMessage = v; A.save('settings'); }),
      fToggle('Honesty reminders', 'Occasionally remind you she is a rule-based program, not AI.', () => s().chat.honestyNotes, (v) => { s().chat.honestyNotes = v; A.save('settings'); })),
    section('Content & abilities',
      h('p', { class: 'muted', style: { marginTop: 0 } }, 'AMORA is for adults (18+). Flirty and steamy talk stays suggestive — scenes fade to black — and her photos are real portrait photographs, kept appropriate to your content level. The level you choose is also limited by how close you two are, unless you turn off relationship gating in Her → Relationship.'),
      fChips('Content level', [['0', '🌸 Sweet'], ['1', '😉 Flirty'], ['2', '🔥 Steamy'], ['3', '🌶️ Spicy']], () => String(s().content.level), (v) => { s().content.level = +v; A.save('settings'); A.chat?.refreshSuggestions(); },
        'Sweet: wholesome and romantic. Flirty: teasing and playful. Steamy: sensual talk and lingerie / swimwear photos. Spicy: her boldest, most seductive side — still non-graphic, never nude.'),
      fToggle('Photos of herself', 'She can send selfies and photos based on how she looks, when you ask (use the camera button in the chat).', () => s().photos.enabled, (v) => { s().photos.enabled = v; A.save('settings'); }),
      fToggle('Knowledge lookup (online, optional)', 'Lets her look up topics on Wikipedia and a dictionary when you ask “what is…”, “who was…” or “define…”. Only the subject of your question (e.g. “black holes”) is sent to those sites — never your name, memories or chats. Off by default.', () => s().lookup.enabled, (v) => { s().lookup.enabled = v; A.save('settings'); }),
      h('small', { class: 'muted' }, 'Always available offline: a calculator, unit converter, dice / coin / picker, date maths, jokes, stories, poems and games. Try “what’s 15% of 80”, “convert 5 miles to km”, “roll a d20”, “how many days until Christmas”.')),
    section('Your data',
      h('p', { class: 'muted', style: { marginTop: 0 } }, 'Everything is stored locally in this browser (', usage, ' used). Nothing is uploaded anywhere.'),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn primary', onclick: () => { A.flush(); exportBackup(A); } }, icon('download', 16), 'Full backup (JSON)'),
        h('button', { class: 'btn', onclick: async () => { const f = await pickFile('.json,application/json'); if (!f) return; try { const data = parseFile(await readText(f)); if (!(await confirmBox('Replace ALL current companions, memories and chats with this backup?', 'Restore', true))) return; importBackup(A, data); A.applyTheme(); toast('Backup restored'); A.go('chat', true); } catch (e) { toast(e.message, 'err'); } } }, icon('upload', 16), 'Restore backup'),
        h('button', { class: 'btn', onclick: () => exportThreadsJSON(A) }, icon('download', 16), 'Export conversations'),
        h('button', { class: 'btn danger', onclick: async () => { if (await confirmBox('Erase ALL data in this account — companions, chats, memory, journal, settings? Export a backup first if you want to keep it.', 'Erase account data', true)) { Store.clearAll(); try { const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); } catch { /* ignore */ } location.hash = ''; location.reload(); } } }, icon('trash', 16), 'Erase everything')),
      h('div', { style: { marginTop: '12px' } }, h('button', { class: 'btn ghost', onclick: async () => { if (await confirmBox('Reset appearance and chat settings to defaults? Companions and chats are kept.', 'Reset')) { const d = defaultSettings(); const keep = { onboarded: s().onboarded, ageConfirmed: s().ageConfirmed, userName: s().userName, content: s().content, photos: s().photos, lookup: s().lookup }; Object.assign(A.state.settings, d, keep); apply(); toast('Settings reset'); A.go('settings', true); } } }, icon('refresh', 16), 'Reset settings'))),
    section('Install & offline', install),
    section('About AMORA & honest limits',
      h('p', { style: { marginTop: 0 } }, 'AMORA is a customizable companion character that runs entirely in your browser using hand-written JavaScript rules, a library of dialogue templates and a small memory. ', h('b', 'There is no AI, no language model, no server and no tracking.')),
      h('ul', { class: 'lines' },
        h('li', 'She recognises keywords and patterns; she does not truly understand language, and can be wrong or vague. When she doesn’t know something she says so.'),
        h('li', 'She can talk about a very wide range of things, but without an AI model she cannot reason about arbitrary topics. Turn on Knowledge lookup for factual answers from Wikipedia.'),
        h('li', 'Her photos are realistic portraits of fictional adult characters (AI-generated imagery) — not photographs of real people.'),
        h('li', 'Her “feelings” are scripted reactions driven by your settings — an experience, not a mind.'),
        h('li', 'AMORA is for adults (18+). She is not a substitute for friends, family or professional help. If you are struggling, please reach out to someone you trust or a local crisis service.'),
        h('li', 'You can read and change nearly everything she says in the Dialogue tab, and extend her database in code — see the README.')),
      h('small', { class: 'muted' }, 'AMORA v1.0')));
  root.append(page);
  return root;
}
