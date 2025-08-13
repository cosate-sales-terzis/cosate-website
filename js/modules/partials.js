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
    const location = translations[prop.location_key] || prop.location_key || "";
    const status = translations[prop.status_key] || prop.status_key || "";
    // **ΔΙΟΡΘΩΣΗ:** Ελέγχουμε αν υπάρχει τιμή πριν προσπαθήσουμε να τη μορφοποιήσουμε
    const price = prop.price ? `${prop.currency}${new Intl.NumberFormat('de-DE').format(prop.price)}` : "";

    return `
        <div class="property-card animate-on-scroll">
            <div class="property-card-image">
                <img src="${prop.main_image}" alt="${title}" onerror="this.onerror=null;this.src='assets/images/placeholder.jpg';">
                <div class="property-card-status">${status}</div>
            </div>
            <div class="property-card-body">
                <h3>${title}</h3>
                <p class="location">${location}</p>
                <p class="price">${price}</p>
                <div class="features">
                    <span><i class="icon-bed"></i> ${prop.bedrooms} Beds</span>
                    <span><i class="icon-bath"></i> ${prop.bathrooms} Baths</span>
                    <span><i class="icon-area"></i> ${prop.area} m²</span>
                </div>
            </div>
        </div>
    `;
}

function createNewProjectSection(prop) {
     const title = translations[prop.title_key] || prop.title_key;
     const tag = translations['new_project_tag'] || 'Our New Project';
     const desc = translations['new_project_desc'] || '';
     const btnText = translations['new_project_btn'] || 'Explore';

     return `
        <div class="container">
            <div class="new-project-content animate-on-scroll">
                <div class="new-project-text">
                    <h2 data-lang-key="new_project_tag">${tag}</h2>
                    <h3 data-lang-key="new_project_title">${title}</h3>
                    <p data-lang-key="new_project_desc">${desc}</p>
                    <a href="#" class="btn btn-primary" data-lang-key="new_project_btn">${btnText}</a>
                </div>
                <div class="new-project-image">
                    <img src="${prop.main_image}" alt="${title}" onerror="this.onerror=null;this.src='assets/images/placeholder.jpg';">
                </div>
            </div>
        </div>
     `;
}

export async function displayProperties(langTranslations) {
    translations = langTranslations;
    await fetchProperties();

    const featuredContainer = document.getElementById('featured-properties-grid');
    const newProjectContainer = document.getElementById('new-project-section-placeholder');

    if (featuredContainer) {
        const featuredProperties = allProperties.filter(p => p.isFeatured);
        featuredContainer.innerHTML = featuredProperties.map(createPropertyCard).join('');
    }

    if (newProjectContainer) {
        const newProject = allProperties.find(p => p.isNewProject);
        if (newProject) {
            newProjectContainer.innerHTML = createNewProjectSection(newProject);
        }
    }
}