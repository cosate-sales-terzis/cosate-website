// static/js/main.js (FINAL VERSION - With Counters Fix)

import { initLanguageSwitcher, getCurrentTranslations } from './modules/i18n.js';
import { displayProperties } from './modules/properties.js';

// --- ΟΡΙΣΜΟΣ ΣΥΝΑΡΤΗΣΕΩΝ ---

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

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.main-nav a');
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = new URL(link.href).pathname;
        if (link.getAttribute('href') === '/listings' && currentPath.startsWith('/property')) {
            link.classList.add('active');
        } else if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
}

function initListingsCarousels() {
    const allCards = document.querySelectorAll('.property-card');
    if (allCards.length === 0) return;

    allCards.forEach(card => {
        const imageContainer = card.querySelector('.property-card-image');
        const imageEl = card.querySelector('.property-card-main-image');
        const prevBtn = card.querySelector('.prev-button');
        const nextBtn = card.querySelector('.next-button');

        if (!imageContainer || !imageEl || !prevBtn) return; // Αν δεν υπάρχουν κουμπιά, σταμάτα

        const imagesAttr = imageContainer.dataset.images;
        if (!imagesAttr) return;

        try {
            const imagePaths = JSON.parse(imagesAttr);
            if (imagePaths.length <= 1) return;

            let currentIndex = 0;
            const getStaticUrl = (path) => `/static/${path}`;

            const updateImage = () => {
                imageEl.src = getStaticUrl(imagePaths[currentIndex]);
            };

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Σταματάει το click από το να πάει στο link της κάρτας
                e.stopPropagation();
                currentIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
                updateImage();
            });

            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentIndex = (currentIndex + 1) % imagePaths.length;
                updateImage();
            });

        } catch(e) {
            console.error("Failed to init card carousel", e);
        }
    });
}

function initFaqAccordion() {
    const allQuestions = document.querySelectorAll('.faq-question');
    if (allQuestions.length === 0) return;

    allQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = item.querySelector('.faq-answer');
            const isActive = question.classList.contains('active');

            // Κλείσε όλα τα άλλα items
            allQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.style.maxHeight = null;
            });

            // Αν το πατημένο ήταν κλειστό, άνοιξέ το
            if (!isActive) {
                question.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// --- ΒΟΗΘΗΤΙΚΗ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΤΟ ΜΕΤΡΗΜΑ ---
function startCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    if (isNaN(target)) return;

    let current = 0;
    const duration = 2000; // 2 δευτερόλεπτα
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            clearInterval(timer);
            element.innerText = target + '+';
        } else {
            element.innerText = Math.ceil(current) + '+';
        }
    }, stepTime);
}

// --- ΔΙΟΡΘΩΜΕΝΗ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ANIMATIONS & COUNTERS ---
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Έλεγχος για γενικά animations
                if (entry.target.classList.contains('animate-on-scroll')) {
                    entry.target.classList.add('is-visible');
                }
                
                // Έλεγχος για μετρητές
                if (entry.target.classList.contains('stat-number')) {
                    startCounter(entry.target);
                }

                // Σταμάτα να παρακολουθείς το στοιχείο
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Πλέον παρακολουθεί και τα δύο είδη στοιχείων
    document.querySelectorAll('.animate-on-scroll, .stat-number').forEach(element => {
        observer.observe(element);
    });
}


function initPropertyCarousel() {
    // ... (ο κώδικας του carousel παραμένει ο ίδιος) ...
    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) return;
    const imagesAttr = carouselContainer.dataset.images;
    if (!imagesAttr) return;
    try {
        const imagePaths = JSON.parse(imagesAttr);
        if (imagePaths.length === 0) return;
        const mainImage = carouselContainer.querySelector('.carousel-main-image');
        const prevButton = carouselContainer.querySelector('.prev-button');
        const nextButton = carouselContainer.querySelector('.next-button');
        const thumbnailsContainer = carouselContainer.querySelector('.carousel-thumbnails');
        let currentIndex = 0;
        const getStaticUrl = (path) => `/static/${path}`;
        function updateCarousel(newIndex) {
            currentIndex = (newIndex + imagePaths.length) % imagePaths.length;
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.src = getStaticUrl(imagePaths[currentIndex]);
                mainImage.style.opacity = '1';
            }, 200);
            const allThumbs = thumbnailsContainer.querySelectorAll('.thumbnail-image');
            allThumbs.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentIndex);
                if (index === currentIndex) {
                    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        }
        thumbnailsContainer.innerHTML = '';
        imagePaths.forEach((path, index) => {
            const thumb = document.createElement('img');
            thumb.src = getStaticUrl(path);
            thumb.classList.add('thumbnail-image');
            thumb.addEventListener('click', () => updateCarousel(index));
            thumbnailsContainer.appendChild(thumb);
        });
        if (prevButton) prevButton.addEventListener('click', () => updateCarousel(currentIndex - 1));
        if (nextButton) nextButton.addEventListener('click', () => updateCarousel(currentIndex + 1));
        updateCarousel(0);
    } catch (e) {
        console.error("Failed to initialize carousel:", e);
    }
}
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


function initListingsMap() {
    const mapElement = document.getElementById('listings-map');
    if (!mapElement || typeof mapProperties === 'undefined') {
        if (mapElement) mapElement.closest('.listings-map-section').style.display = 'none';
        return;
    }

    const officeCoords = [40.708090, 23.699340];
    const map = L.map('listings-map').setView(officeCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markers = [];
    const translations = getCurrentTranslations(); // Παίρνουμε τις τρέχουσες μεταφράσεις

    // Προσθήκη markers για τα ακίνητα
    mapProperties.forEach(prop => {
        const priceText = prop.price > 0 ? `€${(prop.price / 1000).toFixed(0)}K` : '...';
        const pricePinIcon = L.divIcon({ className: 'price-pin', html: priceText, iconSize: [60, 28] });
        const marker = L.marker([prop.lat, prop.lon], { icon: pricePinIcon });

        const popupContent = `
            <div style="width:200px; font-family: 'Plus Jakarta Sans', sans-serif;">
                <a href="/property/${prop.id}" style="text-decoration:none; color:inherit;">
                    <img src="/static/${prop.main_image}" alt="" style="width:100%; height:120px; object-fit:cover; border-radius:8px;">
                    <h5 style="margin:8px 0 5px; font-size:14px; font-weight:600;" data-lang-key="${prop.title_key}">${translations[prop.title_key] || prop.title_key}</h5>
                </a>
                <p style="margin:0; font-size:16px; font-weight:700; color:#e12828;">
                    ${prop.price > 0 ? '€' + prop.price.toLocaleString('de-DE') : `<span data-lang-key="price_on_request">${translations['price_on_request']}</span>`}
                </p>
                <div class="popup-stats" style="display:flex; gap:10px; margin-top:8px; font-size:12px; color:#555;">
                    <span><i class="bi bi-aspect-ratio"></i> ${prop.area} m²</span>
                    <span><i class="bi bi-door-open"></i> ${prop.bedrooms}</span>
                    <span><i class="bi bi-badge-wc"></i> ${prop.bathrooms}</span>
                </div>
            </div>
        `;
        marker.bindPopup(popupContent);
        markers.push(marker);
    });

    // ===============================================
    // ==   ΑΝΑΒΑΘΜΙΣΜΕΝΗ ΠΙΝΕΖΑ ΓΡΑΦΕΙΟΥ           ==
    // ===============================================
    const officeIcon = L.divIcon({
        className: 'office-pin',
        html: '<i class="bi bi-building"></i>',
        iconSize: [40, 40]
    });
    const officeMarker = L.marker(officeCoords, { icon: officeIcon }).addTo(map);

    // Δημιουργούμε το περιεχόμενο του popup δυναμικά
    const officePopupContent = `
        <div style="width:180px; font-family: 'Plus Jakarta Sans', sans-serif; text-align:center;">
            <img src="/static/assets/images/office.png" alt="Our Office" style="width:100%; height:auto; border-radius:8px; margin-bottom:8px;">
            <b data-lang-key="office_popup_title">${translations['office_popup_title'] || 'Το Γραφείο μας'}</b>
            <br>
            <span data-lang-key="office_popup_address">${translations['office_popup_address'] || 'Ελ. Βενιζέλου 40, Νέα Βρασνά'}</span>
        </div>
    `;
    officeMarker.bindPopup(officePopupContent);
    // ===============================================

    if (markers.length > 0) {
        const featureGroup = L.featureGroup(markers).addTo(map);
        map.fitBounds(featureGroup.getBounds().pad(0.2));
    }
}
function initLightbox() {
    const carouselContainer = document.querySelector('.carousel-container');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    if (!carouselContainer || !lightboxOverlay) return;

    const openBtn = carouselContainer.querySelector('.fullscreen-button');
    const mainCarouselImage = carouselContainer.querySelector('.carousel-main-image');
    
    const closeBtn = lightboxOverlay.querySelector('.lightbox-close');
    const lightboxImage = document.getElementById('lightbox-image');
    const nextBtn = lightboxOverlay.querySelector('.lightbox-next');
    const prevBtn = lightboxOverlay.querySelector('.lightbox-prev');
    const lightboxThumbnailsContainer = lightboxOverlay.querySelector('.lightbox-thumbnails');
    
    const imagesAttr = carouselContainer.dataset.images;
    if (!imagesAttr) return;

    try {
        const imagePaths = JSON.parse(imagesAttr);
        let currentIndex = 0;
        const getStaticUrl = (path) => `/static/${path}`;

        // Κεντρική συνάρτηση που ενημερώνει τα πάντα στο lightbox
        function showImageAtIndex(index) {
            currentIndex = (index + imagePaths.length) % imagePaths.length;
            lightboxImage.src = getStaticUrl(imagePaths[currentIndex]);

            // Ενημέρωσε το active thumbnail μέσα στο lightbox
            const allThumbs = lightboxThumbnailsContainer.querySelectorAll('.lightbox-thumb-img');
            allThumbs.forEach((thumb, idx) => {
                thumb.classList.toggle('active', idx === currentIndex);
            });
        }

        function openLightbox() {
            // Βρίσκει ποια εικόνα φαίνεται στο κυρίως carousel
            const currentCarouselSrc = mainCarouselImage.src;
            const currentCarouselPath = new URL(currentCarouselSrc).pathname;
            
            // Βρίσκει το index αυτής της εικόνας
            const startIndex = imagePaths.findIndex(path => getStaticUrl(path) === currentCarouselPath);
            
            showImageAtIndex(startIndex >= 0 ? startIndex : 0);
            lightboxOverlay.classList.add('active');
        }

        function closeLightbox() {
            lightboxOverlay.classList.remove('active');
        }

        // --- Event Listeners ---
        openBtn.addEventListener('click', openLightbox); // Ανοίγει ΜΟΝΟ από το κουμπί
        closeBtn.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) closeLightbox();
        });
        nextBtn.addEventListener('click', () => showImageAtIndex(currentIndex + 1));
        prevBtn.addEventListener('click', () => showImageAtIndex(currentIndex - 1));

        document.addEventListener('keydown', (e) => {
            if (lightboxOverlay.classList.contains('active')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') nextBtn.click();
                if (e.key === 'ArrowLeft') prevBtn.click();
            }
        });

        // Δημιουργία των thumbnails μέσα στο lightbox ΜΟΝΟ μία φορά
        imagePaths.forEach((path, index) => {
            const thumb = document.createElement('img');
            thumb.src = getStaticUrl(path);
            thumb.classList.add('lightbox-thumb-img');
            thumb.addEventListener('click', () => showImageAtIndex(index));
            lightboxThumbnailsContainer.appendChild(thumb);
        });

    } catch(e) { console.error("Lightbox init failed", e); }
}

function initSpotlightGallery() {
    const gallery = document.querySelector('.spotlight-gallery');
    if (!gallery) return;

    const projectImages = [
        "assets/images/Project_kerdylia/ekso1.jpg",
        "assets/images/Project_kerdylia/monokatoikies.png",
        "assets/images/Project_kerdylia/Isogio.png",
        "assets/images/Project_kerdylia/1os_orofos.png"
    ];

    let currentIndex = 0;
    const img = document.createElement('img');
    gallery.appendChild(img);

    const showNextImage = () => {
        currentIndex = (currentIndex + 1) % projectImages.length;
        img.style.opacity = 0;
        setTimeout(() => {
            img.src = `/static/${projectImages[currentIndex]}`;
            img.style.opacity = 1;
        }, 500);
    };

    showNextImage(); // Εμφάνισε την πρώτη εικόνα
    setInterval(showNextImage, 4000); // Άλλαζε εικόνα κάθε 4 δευτερόλεπτα
}




// --- ΚΕΝΤΡΙΚΟΣ ΕΓΚΕΦΑΛΟΣ ---
document.addEventListener('DOMContentLoaded', async () => {
    await initLanguageSwitcher();
    initMobileMenu();
    setActiveNavLink();
    initScrollAnimations();
    if (document.querySelector('.hero-section')) {
        initHeroVideos();
    }
    if (document.getElementById('featured-properties-grid')) {
        await displayProperties(getCurrentTranslations());
    }

    if (document.querySelector('.project-spotlight-section')) {
        initSpotlightGallery();
    }

    if (document.querySelector('.faq-accordion')) {
        initFaqAccordion();
    }
    if (document.querySelector('.property-single-section')) {
        initPropertyCarousel();
        initLightbox();
    }
    if (document.querySelector('.listings-section') || document.querySelector('.available-units-section')) {
        initListingsCarousels();
        // Σημείωση: Ο χάρτης καλείται μόνο αν είμαστε στη σελίδα listings
        if (document.querySelector('.listings-section')) {
            initListingsMap();
        }
    }
});