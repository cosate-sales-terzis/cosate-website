import { loadPartials } from './modules/partials.js';
import { initLanguageSwitcher, getCurrentTranslations, setLanguage } from './modules/i18n.js';
import { displayProperties } from './modules/properties.js';

function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('is-open');
            menuToggle.classList.toggle('is-active');
        });
    }
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const observeElements = () => {
         document.querySelectorAll('.animate-on-scroll').forEach(element => {
            observer.observe(element);
        });
    }
    
    return { observeElements };
}

async function initializePage() {
    // Βήμα 1: Φόρτωσε τα στατικά μέρη (header/footer)
    await loadPartials();
    
    // Βήμα 2: Αρχικοποίησε τις λειτουργίες που εξαρτώνται από το header/footer
    initMobileMenu(); 
    await initLanguageSwitcher(); 
    
    const { observeElements } = initScrollAnimations();
    
    // Βήμα 3: Συνάρτηση που "ζωγραφίζει" το δυναμικό περιεχόμενο
    const renderDynamicContent = async () => {
        const currentTranslations = getCurrentTranslations();
        await displayProperties(currentTranslations);
        observeElements(); // Επανέλεγξε για νέα στοιχεία προς εμφάνιση
    };

    // Βήμα 4: "Ζωγράφισε" το περιεχόμενο για πρώτη φορά
    await renderDynamicContent();

    // Βήμα 5: "Άκου" για αλλαγές γλώσσας για να ξανα-ζωγραφίσεις το περιεχόμενο
    document.addEventListener('languageChange', renderDynamicContent);
}

// Ξεκίνα τα πάντα
document.addEventListener('DOMContentLoaded', initializePage);