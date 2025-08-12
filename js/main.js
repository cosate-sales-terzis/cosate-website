// Function to fetch translation files and set the language
async function setLanguage(lang) {
  const response = await fetch(`js/i18n/${lang}.json`);
  const translations = await response.json();

  document.querySelectorAll("[data-lang-key]").forEach((elem) => {
    const key = elem.getAttribute("data-lang-key");
    if (translations[key]) {
      elem.innerHTML = translations[key];
    }
  });

  // Set the lang attribute of the html tag
  document.documentElement.lang = lang;
}

// Event listeners for language switcher buttons
document.querySelectorAll(".language-switcher button").forEach((button) => {
  button.addEventListener("click", () => {
    const selectedLang = button.getAttribute("data-lang");
    setLanguage(selectedLang);
  });
});

// Set the default language when the page loads
document.addEventListener("DOMContentLoaded", () => {
  setLanguage("el"); // Set Greek as the default language
});
