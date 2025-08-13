import { loadPartials } from './modules/partials.js';
import { initLanguageSwitcher, getCurrentTranslations } from './modules/i18n.js';
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
    await loadPartials();
    
    initMobileMenu(); 
    await initLanguageSwitcher(); 
    
    const { observeElements } = initScrollAnimations();
    
    const renderDynamicContent = async () => {
        const currentTranslations = getCurrentTranslations();
        await displayProperties(currentTranslations);
        observeElements(); 
    };

    await renderDynamicContent();

    document.addEventListener('languageChange', renderDynamicContent);
}

document.addEventListener('DOMContentLoaded', initializePage);