import { loadPartials } from './modules/partials.js';
import { initLanguageSwitcher, getCurrentTranslations } from './modules/i18n.js';
import { displayProperties } from './modules/properties.js';


function initHeroVideos() {
    const video1 = document.getElementById('heroVideo1');
    const video2 = document.getElementById('heroVideo2');

    if (!video1 || !video2) {
        console.error("Hero videos not found in the DOM.");
        return;
    }

    // Συνάρτηση για ασφαλή αναπαραγωγή ενός βίντεο
    const playVideo = (videoElement) => {
        const playPromise = videoElement.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Autoplay was prevented for video:", videoElement.id, error);
                // Εδώ ο browser μπλόκαρε την αναπαραγωγή.
                // Θα μπορούσαμε να δείξουμε ένα κουμπί play ή μια στατική εικόνα.
            });
        }
    };

    // Λειτουργία εναλλαγής
    video1.addEventListener('ended', () => {
        video1.classList.remove('is-active');
        video2.classList.add('is-active');
        playVideo(video2); // Χρησιμοποιούμε τη νέα μας συνάρτηση
    });

    video2.addEventListener('ended', () => {
        video2.classList.remove('is-active');
        video1.classList.add('is-active');
        playVideo(video1); // Και εδώ
    });

    // Ξεκινάμε το πρώτο βίντεο με τον ασφαλή τρόπο
    playVideo(video1);
}


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
    initHeroVideos();
    await initLanguageSwitcher(); 
    
    const { observeElements } = initScrollAnimations();
    
    const renderDynamicContent = async () => {
        const currentTranslations = getCurrentTranslations();
        if (Object.keys(currentTranslations).length === 0) {
            console.log("Translations not ready yet, skipping render.");
            return;
        }
        await displayProperties(currentTranslations);
        observeElements(); 
    };

    await renderDynamicContent();
    document.addEventListener('languageChange', renderDynamicContent);
}

document.addEventListener('DOMContentLoaded', initializePage);
