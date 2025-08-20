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


function initMobileCarousels() {
    if (window.innerWidth > 768) {
        return;
    }

    // Ρυθμίζουμε το carousel για τις Παροχές (Amenities)
    setupCarousel({
        carouselSelector: '.amenities-grid',
        itemSelector: '.amenity-item',
        dotsContainerId: 'amenities-dots',
        scrollInterval: 3500
    });

    // Ρυθμίζουμε το carousel για τα Ακίνητα (Properties)
    setupCarousel({
        carouselSelector: '.featured-properties .properties-grid',
        itemSelector: '.property-card',
        dotsContainerId: 'properties-dots',
        scrollInterval: 4500
    });
}

function setupCarousel(options) {
    const carousel = document.querySelector(options.carouselSelector);
    const dotsContainer = document.getElementById(options.dotsContainerId);

    if (!carousel || !dotsContainer) return;

    const items = carousel.querySelectorAll(options.itemSelector);
    if (items.length <= 1) return;

    // --- Μόνο για mobile ---
    if (window.innerWidth <= 768) {
        // 1. Δημιουργία κουκίδων
        dotsContainer.innerHTML = '';
        items.forEach(() => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.dot');
        if(dots.length > 0) dots[0].classList.add('active');

        // 2. Ενημέρωση ενεργής κουκίδας
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const itemIndex = Array.from(items).indexOf(entry.target);
                    dots.forEach(d => d.classList.remove('active'));
                    dots[itemIndex].classList.add('active');
                }
            });
        }, { root: carousel, threshold: 0.5 });

        items.forEach(item => observer.observe(item));

        // 3. Λογική Αυτόματης Κύλισης
        let autoScrollInterval;
        const startAutoScroll = () => {
            stopAutoScroll(); // Καθαρίζουμε τυχόν προηγούμενο interval
            autoScrollInterval = setInterval(() => {
                const currentActiveDot = Array.from(dots).findIndex(d => d.classList.contains('active'));
                const nextIndex = (currentActiveDot + 1) % items.length;
                items[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, options.scrollInterval);
        };

        const stopAutoScroll = () => clearInterval(autoScrollInterval);

        carousel.addEventListener('touchstart', stopAutoScroll, { passive: true });
        carousel.addEventListener('touchend', () => setTimeout(startAutoScroll, 5000));

        startAutoScroll();
    }
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
        initMobileCarousels();
        observeElements(); 
    };

    await renderDynamicContent();
    document.addEventListener('languageChange', renderDynamicContent);
}

document.addEventListener('DOMContentLoaded', initializePage);
