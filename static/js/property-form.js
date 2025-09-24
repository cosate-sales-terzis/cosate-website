// static/js/property-form.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Λογική για το πεδίο τηλεφώνου της ΚΥΡΙΑΣ φόρμας ---
    const mainPhoneInputField = document.querySelector("#phone-input");
    if (mainPhoneInputField) {
        window.intlTelInput(mainPhoneInputField, { initialCountry: "gr", utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js" });
    }

    // --- Λογική για τη διαδικασία Πρότασης Τιμής ---
    const proposePriceBtn = document.getElementById('propose-price-btn');
    const priceModal = document.getElementById('price-proposal-modal');
    const contactModal = document.getElementById('proposal-contact-modal');

    if (!proposePriceBtn || !priceModal || !contactModal) return;

    const priceElement = document.querySelector('.property-sidebar .price');
    const basePrice = priceElement ? parseFloat(priceElement.dataset.eurPrice) : 0;

    if (basePrice === 0) {
        proposePriceBtn.style.display = 'none';
        return;
    }

    // --- Στοιχεία του Modal 1 (Εισαγωγή Τιμής) ---
    const proposalInput = priceModal.querySelector('#proposal-price-input');
    const errorMessage = priceModal.querySelector('#price-proposal-error');
    const continueBtn = priceModal.querySelector('#submit-proposal-btn');
    const originalPriceDisplay = priceModal.querySelector('#modal-original-price');

    // --- Στοιχεία του Modal 2 (Φόρμα Στοιχείων) ---
    const contactForm = contactModal.querySelector('#proposal-contact-form');
    const hiddenPriceInput = contactModal.querySelector('#hidden-proposed-price');
    const proposalPhoneInput = contactModal.querySelector("#proposal-phone-input");
    const proposalIntlTel = window.intlTelInput(proposalPhoneInput, { initialCountry: "gr", utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js" });

    // --- Event Listeners ---
    proposePriceBtn.addEventListener('click', () => {
        originalPriceDisplay.textContent = `€${basePrice.toLocaleString('de-DE')}`;
        priceModal.classList.add('active');
    });

    priceModal.querySelector('.modal-close').addEventListener('click', () => priceModal.classList.remove('active'));
    contactModal.querySelector('.modal-close').addEventListener('click', () => contactModal.classList.remove('active'));

    continueBtn.addEventListener('click', () => {
        const proposedPrice = parseFloat(proposalInput.value);
        const minPrice = basePrice * 0.85; // Όριο: -15%

        if (isNaN(proposedPrice) || proposedPrice < minPrice) {
            errorMessage.textContent = `Η προσφορά πρέπει να είναι τουλάχιστον €${Math.ceil(minPrice).toLocaleString('de-DE')}.`;
            return;
        }

        errorMessage.textContent = '';
        hiddenPriceInput.value = proposedPrice;
        priceModal.classList.remove('active');
        contactModal.classList.add('active');
    });

    contactForm.addEventListener('submit', () => {
        const fullNumber = proposalIntlTel.getNumber();
        const hiddenPhoneInput = document.createElement('input');
        hiddenPhoneInput.type = 'hidden';
        hiddenPhoneInput.name = 'phone_full';
        hiddenPhoneInput.value = fullNumber;
        contactForm.appendChild(hiddenPhoneInput);
    });
});