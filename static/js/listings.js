import { loadPartials } from './modules/partials.js';
import { initLanguageSwitcher, getCurrentTranslations } from './modules/i18n.js';
// Σημείωση: Εδώ εισάγουμε το ίδιο module properties.js! Δεν χρειάζεται να ξαναγράψουμε τον κώδικα.
import { displayAllProperties } from './modules/properties.js'; 

function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const propertiesGrid = document.getElementById('all-properties-grid');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            
            // Filter and display properties
            displayAllProperties(getCurrentTranslations(), filter);
        });
    });
}

async function initializePage() {
    await loadPartials();
    await initLanguageSwitcher(); 
    
    const renderAndSetup = async () => {
        await displayAllProperties(getCurrentTranslations(), 'all');
        initFilters();
    };

    await renderAndSetup();
    document.addEventListener('languageChange', renderAndSetup);
}

document.addEventListener('DOMContentLoaded', initializePage);
