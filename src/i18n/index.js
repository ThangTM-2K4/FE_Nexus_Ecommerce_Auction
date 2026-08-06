import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const STORAGE_KEY = 'app_language';

const savedLanguage = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'vi' || stored === 'en') return stored;
  } catch {
    /* ignore */
  }
  return 'vi';
})();

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;
export { STORAGE_KEY };
