let translations = {};
const flagBaseUrl = 'assets/images/flags/';

// **Η ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΕΔΩ:** Σωστή αντιστοίχιση κωδικών γλώσσας με ονόματα αρχείων σημαιών
const flagMap = {
    el: 'gr',
    en: 'gb',
    sr: 'rs',
    bg: 'bg'
};

async function setLanguage(lang) {
    try {
        const response = await fetch(`js/data/i18n/${lang}.json`);
        if (!response.ok) throw new Error(`Language file not found: ${lang}.json`);
        translations = await response.json();

        document.querySelectorAll('[data-lang-key]').forEach(elem => {
            const key = elem.getAttribute('data-lang-key');
            if (translations[key]) elem.textContent = translations[key];
        });
        
        document.querySelectorAll('[data-lang-placeholder]').forEach(elem => {
            const key = elem.getAttribute('data-lang-placeholder');
            if (translations[key]) elem.placeholder = translations[key];
        });

        document.documentElement.lang = lang;
        localStorage.setItem('preferredLanguage', lang);
        updateLanguageSwitcher(lang);

    } catch (error) {
        console.error('Failed to set language:', error);
    }
}

function updateLanguageSwitcher(lang) {
    const currentFlag = document.getElementById('current-flag');
    const currentLangText = document.getElementById('current-lang-text');
    const flagFileName = flagMap[lang] || 'gr'; // Default σε ελληνική σημαία
    if (currentFlag) currentFlag.src = `${flagBaseUrl}${flagFileName}.svg`;
    if (currentLangText) currentLangText.textContent = lang.toUpperCase();
}

export async function initLanguageSwitcher() {
    const switcher = document.querySelector('.language-switcher');
    if (!switcher) return;

    switcher.addEventListener('click', (e) => {
        e.stopPropagation();
        switcher.classList.toggle('is-open');
    });

    document.querySelectorAll('.lang-dropdown a').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const selectedLang = link.getAttribute('data-lang');
            await setLanguage(selectedLang);
            document.dispatchEvent(new CustomEvent('languageChange'));
            switcher.classList.remove('is-open');
        });
    });
    
    document.addEventListener('click', () => {
        if (switcher.classList.contains('is-open')) {
            switcher.classList.remove('is-open');
        }
    });

    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'el';
    await setLanguage(preferredLanguage);
}

export function getCurrentTranslations() {
    return translations;
}