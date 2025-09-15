# app.py
from flask import Flask, render_template, request, jsonify
import json
import os # Προσθέτουμε το os για τις μεταβλητές περιβάλλοντος
import google.generativeai as genai # Προσθέτουμε τη βιβλιοθήκη του Gemini
import sqlite3
from datetime import datetime 

app = Flask(__name__)

# --- Ρύθμιση του Gemini API ---
# Διαβάζει το κλειδί από τις μεταβλητές περιβάλλοντος που ορίσαμε
GOOGLE_API_KEY = "AIzaSyBl-EPBMvzrFj7yXV7OvpVYmS8gDe_KRLU"
genai.configure(api_key=GOOGLE_API_KEY)

# ===============================================
# == ΝΕΟ: Route για το Chatbot                ==
# ===============================================


@app.route('/ask-chatbot', methods=['POST'])
def ask_chatbot():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    bot_reply = "Sorry, I am unable to respond right now." # Προκαθορισμένη απάντηση

    try:
        # -- ΕΠΙΚΟΙΝΩΝΙΑ ΜΕ GEMINI --
        properties_data = load_properties()
        context = "Here is the available property data:\n"
        for prop in properties_data:
            context += f"- Property ID: {prop['id']}, Type: {prop['type']}, Location: {prop['location']}, Price: {'€' + str(prop['price']) if prop.get('price', 0) > 0 else 'On request'}\n"
        
        context += "\nCompany Contact Info:\n"
        context += "Phone: +30 694 619 3307\n"
        context += "Email: info@grouprealestate.gr\n"
        context += "Address: El. Venizelou 40, Nea Vrasna, 57021\n"

        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        
        prompt = f"""
        You are a helpful and professional real estate assistant for "Group Real Estate" and your answers must always be in Greek.
        Your role is to answer user questions based ONLY on the information provided below.
        Be friendly, concise, and act like a real estate expert.
        If the user asks for something not in the provided data, politely state that you don't have that information.
        Never mention that you are an AI.

        --- PROVIDED DATA ---
        {context}
        --- END OF DATA ---

        User Question: "{user_message}"
        """
        
        response = model.generate_content(prompt)
        bot_reply = response.text

    except Exception as e:
        print(f"Error communicating with Gemini API: {e}")
        # Αν αποτύχει η κλήση στο Gemini, το bot_reply θα παραμείνει το default μήνυμα σφάλματος

    # -- ΑΠΟΘΗΚΕΥΣΗ ΣΤΗ ΒΑΣΗ ΔΕΔΟΜΕΝΩΝ --
    # Αυτό το βήμα γίνεται πάντα, αφού έχουμε πλέον σίγουρα μια απάντηση στο bot_reply
    try:
        conn = sqlite3.connect('database.db')
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO conversations (timestamp, user_question, bot_answer) VALUES (?, ?, ?)",
            (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), user_message, bot_reply)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging to database: {e}")

    # -- ΑΠΟΣΤΟΛΗ ΑΠΑΝΤΗΣΗΣ ΣΤΟΝ ΧΡΗΣΤΗ --
    # Τέλος, επιστρέφουμε την απάντηση
    return jsonify({'reply': bot_reply})

# --- Βοηθητική Συνάρτηση για τη φόρτωση των ακινήτων ---
def load_properties():
    with open('static/js/data/properties.json', 'r', encoding='utf-8') as f:
        return json.load(f)
    
@app.context_processor
def inject_locations():
    properties = load_properties()
    location_counts = {}
    location_names = {}
    for prop in properties:
        slug = prop.get('location_slug')
        name = prop.get('location')
        if slug and name:
            location_counts[slug] = location_counts.get(slug, 0) + 1
            if slug not in location_names:
                location_names[slug] = name

    sorted_locations = sorted(location_names.items(), key=lambda item: item[1])

    return dict(
        location_counts=location_counts,
        sorted_locations=sorted_locations
    )

@app.template_filter('formatprice')
def format_price(value):
    try:
        # Μετατρέπουμε την τιμή σε ακέραιο αριθμό
        price = int(value)
        # Τη μορφοποιούμε με κόμμα στις χιλιάδες και μετά αντικαθιστούμε το κόμμα με τελεία
        return f'{price:,}'.replace(',', '.')
    except (ValueError, TypeError):
        # Αν η τιμή δεν είναι αριθμός (π.χ. "Κατόπιν Επικοινωνίας"), την επιστρέφουμε ως έχει
        return value
    
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about_page():
    return render_template('about.html')

@app.route('/listings')
def listings_page():
    all_properties = load_properties() # Φορτώνουμε όλα τα ακίνητα
    
    current_filters = {
        'type': request.args.get('type', 'all'),
        'location': request.args.get('location', 'all'),
        'sort': request.args.get('sort', '')
    }

    # Δημιουργούμε τα δεδομένα του χάρτη ΑΠΟ ΟΛΑ ΤΑ ΑΚΙΝΗΤΑ, ΠΡΙΝ ΤΟ ΦΙΛΤΡΑΡΙΣΜΑ
    map_data = []
    for prop in all_properties:
        if 'lat' in prop and 'lon' in prop:
            map_data.append({
                'id': prop['id'],
                'lat': prop['lat'],
                'lon': prop['lon'],
                'title_key': prop['title_key'],
                'main_image': prop['main_image'],
                'price': prop.get('price', 0),
                'area': prop.get('area', ''),
                'bedrooms': prop.get('bedrooms', ''),
                'bathrooms': prop.get('bathrooms', '')
            })

    # Τώρα φιλτράρουμε τα ακίνητα για να εμφανιστούν ως κάρτες
    filtered_properties = all_properties[:]
    if current_filters['type'] != 'all':
        filtered_properties = [p for p in filtered_properties if p['type'] == current_filters['type']]
    if current_filters['location'] != 'all':
        filtered_properties = [p for p in filtered_properties if p['location_slug'] == current_filters['location']]
    if current_filters['sort'] == 'price_asc':
        filtered_properties.sort(key=lambda p: p['price'] if p['price'] > 0 else float('inf'))
    elif current_filters['sort'] == 'price_desc':
        filtered_properties.sort(key=lambda p: p['price'], reverse=True)

    return render_template('listings.html', 
                           properties=filtered_properties, 
                           current_filters=current_filters,
                           map_data=map_data) # Στέλνουμε τα δεδομένα του χάρτη που περιέχουν τα πάντα

@app.route('/property/<property_id>')
def property_single_page(property_id):
    # 1. Φορτώνουμε όλα τα ακίνητα
    properties = load_properties()
    
    # 2. Βρίσκουμε το ακίνητο που έχει το σωστό id
    # Χρησιμοποιούμε τη συνάρτηση next() για να βρούμε το πρώτο ταίριασμα ή None αν δεν βρεθεί
    selected_property = next((prop for prop in properties if prop['id'] == property_id), None)
    
    # 3. Αν δεν βρεθεί το ακίνητο, θα μπορούσαμε να δείξουμε μια σελίδα 404
    if selected_property is None:
        return "Property not found", 404 # Προσωρινή σελίδα σφάλματος
        
    # 4. Στέλνουμε το ένα, συγκεκριμένο ακίνητο στο νέο μας template
    return render_template('property-single.html', prop=selected_property)


@app.route('/project-kerdylia')
def project_kerdylia_page():
    # 1. Φορτώνουμε όλα τα ακίνητα
    all_properties = load_properties()
    
    # 2. Φιλτράρουμε για να κρατήσουμε ΜΟΝΟ όσα ανήκουν στο project
    project_properties = [
        prop for prop in all_properties 
        if prop.get("project_id") == "kerdylia_riviera"
    ]
    
    # 3. Στέλνουμε τη φιλτραρισμένη λίστα στο template
    return render_template('project-kerdylia.html', properties=project_properties)

@app.route('/contact', methods=['GET', 'POST'])
def contact_page():
    if request.method == 'POST':
        # Αν η φόρμα υποβληθεί, παίρνουμε τα δεδομένα
        name = request.form['name']
        email = request.form['email']
        subject = request.form['subject']
        message = request.form['message']

        # Προς το παρόν, απλώς τα τυπώνουμε στο τερματικό για να δούμε ότι δουλεύει
        print(f"ΝΕΟ ΜΗΝΥΜΑ ΑΠΟ: {name} ({email})")
        print(f"ΘΕΜΑ: {subject}")
        print(f"ΜΗΝΥΜΑ: {message}")

        # Εδώ αργότερα θα μπει ο κώδικας για την αποστολή email

        return render_template('contact.html') # Μπορούμε να επιστρέψουμε και μια σελίδα "Ευχαριστούμε"

    # Αν η μέθοδος είναι GET, απλώς δείχνουμε τη σελίδα
    return render_template('contact.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
