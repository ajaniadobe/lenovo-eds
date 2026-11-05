/**
 * footer — Lenovo commonFooter, template-slotted from stardust/prototypes (footer.commonFooter)
 * with the authored /footer document slotted by role (classified by content, not position):
 *   - the paragraph mentioning "email" → signup label (the form itself is block UI)
 *   - a list of :social-*: icon links → social row (desktop + phone copies)
 *   - a text paragraph followed by a :flag-*: link → country title + locale link (links to source)
 *   - a paragraph of :app-*: icon links → app badges
 *   - each h2 + following list → one link column
 *   - the "©" paragraph + following list → copyright line + legal links
 * Unclassified authored elements are appended to the link area (never dropped).
 *
 * @ew-exempt email form messages — block UI (no backend connected, dynamics row 8)
 */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function el(tag, className = '', attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

const iconName = (node) => {
  const icon = node && node.querySelector('.icon');
  const cls = icon ? [...icon.classList].find((c) => c.startsWith('icon-')) : '';
  return cls ? cls.substring(5) : '';
};

// Presentational clones (the phone social row) must not keep the editor's indices (EW4).
function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  return node;
}

function buildEmailForm() {
  const view = el('div', 'select-view email-view');
  const form = el('form', 'email-style', { novalidate: '' });
  const label = el('label', '', { for: 'footer-email' });
  label.textContent = 'Email';
  const input = el('input', '', {
    id: 'footer-email', type: 'email', name: 'email', autocomplete: 'email', 'aria-label': 'Enter Email address',
  });
  form.append(label, input);
  const submit = el('button', 'toggle-mask-icon iconfont-homehero-right-arrow', {
    type: 'button', 'aria-label': 'Click to go Next/Subscribe',
  });
  view.append(form, submit);
  const msg = el('div', 'email-message', { role: 'status', 'aria-live': 'polite' });
  msg.hidden = true;
  const say = (t) => {
    msg.textContent = t;
    msg.hidden = !t;
  };
  input.addEventListener('input', () => {
    label.hidden = !!input.value;
    say('');
  });
  const send = () => {
    const v = input.value.trim();
    if (!v) say('Email address is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) say('Please enter the correct email address!');
    else say('Thank you. Email sign-up is not connected on this site yet.');
  };
  submit.addEventListener('click', send);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });
  return [view, msg];
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;
  fragment.querySelectorAll('.metadata, .section-metadata').forEach((m) => m.remove());

  const nodes = [...fragment.querySelectorAll('.default-content-wrapper > *')];

  const root = el('div', 'common-footer');
  const inner = el('div', 'common-footer-main');
  const head = el('div', 'footer-header');
  const email = el('div', 'footer-email');
  const country = el('div', 'select-country');
  const apps = el('div', 'software-download');
  const columns = el('div', 'pc-footer-nav');
  const copyright = el('div', 'copyright');
  let social = null;
  let column = null;
  let inCopyright = false;

  nodes.forEach((node, i) => {
    const next = nodes[i + 1];
    const icon = iconName(node);
    if (/^H[1-6]$/.test(node.tagName)) {
      inCopyright = false;
      column = el('div', 'item');
      column.append(node);
      columns.append(column);
    } else if (node.tagName === 'UL' && icon.startsWith('social-')) {
      social = node;
      node.className = 'social-icon desktop-only';
      node.querySelectorAll('a').forEach((a) => {
        const name = iconName(a).replace('social-', '');
        a.setAttribute('aria-label', name === 'x' ? 'X' : name.charAt(0).toUpperCase() + name.slice(1));
      });
    } else if (node.tagName === 'P' && icon.startsWith('app-')) {
      apps.append(...node.childNodes);
      node.remove();
      apps.querySelectorAll('a').forEach((a) => {
        a.setAttribute('aria-label', iconName(a) === 'app-ios' ? 'IOS' : 'Android');
      });
    } else if (node.tagName === 'P' && icon.startsWith('flag-')) {
      const view = el('div', 'select-view country-view');
      const link = node.querySelector('a');
      if (link) link.classList.add('country-link');
      view.append(node);
      country.append(view);
    } else if (node.tagName === 'P' && next && iconName(next).startsWith('flag-')) {
      const title = el('div', 'title-label', { id: 'country-headline' });
      title.append(node);
      country.append(title);
    } else if (node.tagName === 'P' && /©|&copy;|all rights reserved/i.test(node.textContent)) {
      inCopyright = true;
      const all = el('div', 'all-right');
      all.append(node);
      copyright.append(all);
    } else if (node.tagName === 'UL' && inCopyright) {
      const links = el('div', 'link');
      links.append(node);
      copyright.append(links);
    } else if (node.tagName === 'P' && !email.children.length && /email/i.test(node.textContent)) {
      const label = el('div', 'title-label email-label');
      label.append(node);
      email.append(label, ...buildEmailForm());
    } else if (column) {
      column.append(node);
    } else {
      columns.append(node);
    }
  });

  head.append(email);
  if (social) head.append(social);
  head.append(country);
  inner.append(head);
  if (social) {
    const phone = stripInstrumentation(social.cloneNode(true));
    phone.className = 'social-icon mobile-only';
    inner.append(phone);
  }
  inner.append(apps, columns, copyright);
  root.append(inner);
  block.replaceChildren(root);
}
