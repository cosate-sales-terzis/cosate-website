let allProperties = [];
let translations = {};

async function fetchProperties() {
    if (allProperties.length > 0) return;
    try {
        const response = await fetch('js/data/properties.json');
        if (!response.ok) throw new Error('Could not fetch properties.json');
        allProperties = await response.json();
    } catch (error) {
        console.error(error);
    }
}

function createPropertyCard(prop) {
    const title = translations[prop.title_key] || prop.title_key || "Property";
    const status = translations[prop.status_key] || prop.status_key || "";
    const price = prop.price > 0 ? `${prop.currency || '€'}${new Intl.NumberFormat('de-DE').format(prop.price)}` : "Κατόπιν Επικοινωνίας";

    // **ΝΕΑ ΛΟΓΙΚΗ:** Δημιουργία λίστας χαρακτηριστικών δυναμικά
    let featuresHTML = '';
    if (prop.features_keys && Array.isArray(prop.features_keys)) {
        prop.features_keys.forEach(key => {
            featuresHTML += `<span>${translations[key] || key}</span>`;
        });
    }
    
    // **ΠΡΟΣΘΗΚΗ:** Δημιουργία των βασικών στατιστικών (m², δωμάτια, μπάνια)
    const statsHTML = `
        <div class="stats">
            ${prop.area ? `<span><i class="icon-area"></i> ${prop.area} m²</span>` : ''}
            ${prop.bedrooms ? `<span><i class="icon-bed"></i> ${prop.bedrooms} Δωμ.</span>` : ''}
            ${prop.bathrooms ? `<span><i class="icon-bath"></i> ${prop.bathrooms} Μπ.</span>` : ''}
        </div>
    `;

    return `
        <div class="property-card animate-on-scroll">
            <div class="property-card-image">
                <img src="${prop.main_image}" alt="${title}" onerror="this.onerror=null;this.src='assets/images/properties/placeholder.jpg';">
                <div class="property-card-status ${prop.status_key === 'status_hot_offer' ? 'hot-offer' : ''}">${status}</div>
            </div>
            <div class="property-card-body">
                <h3>${title}</h3>
                <p class="price">${price}</p>
                ${statsHTML} 
                <div class="features">
                   <h4>Χαρακτηριστικά:</h4>
                   ${featuresHTML}
                </div>
            </div>
        </div>
    `;
}


export async function displayProperties(langTranslations) {
    translations = langTranslations;
    await fetchProperties();

    const featuredContainer = document.getElementById('featured-properties-grid');

    if (featuredContainer) {
        const featuredProperties = allProperties.filter(p => p.isFeatured);
        featuredContainer.innerHTML = featuredProperties.map(createPropertyCard).join('');
    }
}

// **ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΤΗ ΣΕΛΙΔΑ LISTINGS**
export async function displayAllProperties(langTranslations, filter = 'all') {
    translations = langTranslations;
    await fetchProperties();

    const container = document.getElementById('all-properties-grid');
    if (!container) return;

    let propertiesToDisplay = allProperties;

    if (filter !== 'all') {
        propertiesToDisplay = allProperties.filter(prop => prop.type_key === filter);
    }
    
    if (propertiesToDisplay.length > 0) {
        container.innerHTML = propertiesToDisplay.map(createPropertyCard).join('');
    } else {
        container.innerHTML = `<p>Δεν βρέθηκαν ακίνητα για αυτή την κατηγορία.</p>`;
    }

        // Add this inside displayAllProperties in modules/properties.js
    console.log('displayAllProperties called');
    console.log(document.getElementById('all-properties-grid'));
}
