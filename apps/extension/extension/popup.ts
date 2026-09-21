import { betonCompanySlug, trucareerCompanyId } from '../src/text';

const title = document.querySelector<HTMLElement>('#title')!;
const description = document.querySelector<HTMLElement>('#description')!;
const primary = document.querySelector<HTMLButtonElement>('#primary')!;
const hint = document.querySelector<HTMLElement>('#hint')!;
const resetConsent = document.querySelector<HTMLButtonElement>('#reset-consent')!;
const privacyNote = document.querySelector<HTMLElement>('#privacy-note')!;
const privacySettings = document.querySelector<HTMLDetailsElement>('#privacy-settings')!;

void chrome.storage.local.get('consentedToAiRetention').then((stored) => {
  if (stored.consentedToAiRetention !== true) return;
  privacySettings.hidden = false;
  resetConsent.onclick = () => void chrome.storage.local.set({ consentedToAiRetention: false }).then(() => {
    privacyNote.textContent = 'You will be asked again before your next Ask question.';
    resetConsent.hidden = true;
  }).catch(() => {
    privacyNote.textContent = 'Could not reset this choice. Try again.';
  });
}).catch(() => {
  // The popup remains useful when local storage is unavailable.
});

const show = (heading: string, copy: string, label: string, action: () => void, help = '') => {
  title.textContent = heading;
  description.textContent = copy;
  primary.textContent = label;
  primary.hidden = false;
  primary.className = '';
  primary.onclick = action;
  hint.textContent = help;
};

const openSite = () => void chrome.tabs.create({ url: 'https://deshimula.com/companies' });
const openBeton = () => void chrome.tabs.create({ url: 'https://www.betonkemon.com/en' });
const openTrucareer = () => void chrome.tabs.create({ url: 'https://trucareer.co/companies' });
const otherSite = document.querySelector<HTMLButtonElement>('#other-site')!;
const thirdSite = document.querySelector<HTMLButtonElement>('#third-site')!;
const showSiteChoices = () => {
  title.textContent = 'Research a company';
  description.textContent = 'Choose a site to find a company.';
  hint.textContent = '';
  const choices: Array<[HTMLButtonElement, string, () => void]> = [
    [primary, 'Deshi Mula', openSite],
    [otherSite, 'Beton Kemon', openBeton],
    [thirdSite, 'TruCareer', openTrucareer],
  ];
  choices.forEach(([button, label, action]) => {
    button.hidden = false;
    button.className = 'site-choice';
    button.textContent = label;
    button.onclick = action;
  });
};

void chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
  let url: URL | null = null;
  try { url = tab?.url ? new URL(tab.url) : null; } catch { /* Browser pages may not expose a web URL. */ }
  const deshi = url?.origin === 'https://deshimula.com';
  const beton = url?.protocol === 'https:' && ['betonkemon.com', 'www.betonkemon.com'].includes(url.hostname);
  const trucareer = url?.protocol === 'https:' && ['trucareer.co', 'www.trucareer.co'].includes(url.hostname);
  if (!deshi && !beton && !trucareer) {
    showSiteChoices();
    return;
  }

  const slug = deshi ? url!.pathname.match(/^\/companies\/([^/]+)\/?$/)?.[1] : beton ? betonCompanySlug(url!.href) : trucareerCompanyId(url!.href);
  if (slug && tab?.id) {
    show('Research this company', 'View workplace insights, pay, and stories.', 'Open MulaLens Analytics', () => {
      void chrome.tabs.sendMessage(tab.id!, { type: 'panel:open-current' }).then((result: { ok?: boolean; reason?: string }) => {
        if (result?.ok) window.close();
        else description.textContent = result?.reason === 'not-found' ? 'Research for this company is not available in MulaLens yet.' : 'Reload this page, then try again.';
      }).catch(() => {
        description.textContent = 'Reload this page, then try again.';
      });
    });
    return;
  }

  if (beton) {
    show('Choose a company', 'Select MulaLens Analytics beside a company name when available.', 'Continue on this page', () => window.close());
  } else if (trucareer && ['/', '/companies', '/companies/'].includes(url!.pathname)) {
    show('Choose a company', 'Select MulaLens Analytics beside a company name when available.', 'Continue on this page', () => window.close());
  } else if (trucareer) {
    show('Choose a company', 'Browse TruCareer companies to begin.', 'Browse companies', () => void chrome.tabs.update(tab?.id, { url: 'https://trucareer.co/companies' }).then(() => window.close()));
  } else if (url!.pathname === '/companies' || url!.pathname === '/companies/') {
    show('Choose a company', 'Select MulaLens Analytics beside a company name.', 'Continue on this page', () => window.close());
  } else {
    show('Choose a company', 'Browse the Deshi Mula company directory to begin.', 'Browse companies', () => void chrome.tabs.update(tab?.id, { url: 'https://deshimula.com/companies' }).then(() => window.close()));
  }
}).catch(showSiteChoices);
