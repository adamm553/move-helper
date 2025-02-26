from flask import Flask, render_template, request, redirect, url_for, session
import requests
import logging

app = Flask(__name__)
app.secret_key = 'supersecretkey'

logging.basicConfig(level=logging.DEBUG)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        woj = request.form.get('wojewodztwo')
        miasto = request.form.get('miasto')
        ulica = request.form.get('ulica')
        numer = request.form.get('numer')

        full_address = f"{ulica} {numer}, {miasto}, {woj}, Polska"

        geocode_url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': full_address,
            'format': 'json'
        }
        headers = {
            'User-Agent': 'Flask-App'
        }
        response = requests.get(geocode_url, params=params, headers=headers)
        data = response.json()

        if data:
            lat = data[0]['lat']
            lon = data[0]['lon']
            session['lat'] = lat
            session['lon'] = lon
            session['full_address'] = full_address
            return redirect(url_for('show_map', lat=lat, lon=lon))
        else:
            return "Nie znaleziono lokalizacji dla podanego adresu.", 404
    return render_template('index.html')

@app.route('/map')
def show_map():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    return render_template('map.html', lat=lat, lon=lon)

@app.route('/stats', methods=['GET', 'POST'])
def stats():
    if request.method == 'POST':
        categories = request.form.getlist('category')
        radius_km = request.form.get('radius')
        if not radius_km or not radius_km.isdigit():
            return "Proszę podać poprawny promień (w kilometrach).", 400
        radius = float(radius_km) * 1000
        lat = session.get('lat')
        lon = session.get('lon')
        if not lat or not lon:
            return "Nie znaleziono współrzędnych dla podanego adresu.", 400
        stats_data = fetch_stats(lat, lon, categories, radius)
        return render_template('stats.html', stats_data=stats_data, categories=categories, address=session.get('full_address'))
    return render_template('stats.html', address=session.get('full_address'))

def fetch_stats(lat, lon, categories, radius):
    stats_data = {}
    print(stats_data)
    for category in categories:
        query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="{category}"](around:{radius},{lat},{lon});
          way["amenity"="{category}"](around:{radius},{lat},{lon});
          relation["amenity"="{category}"](around:{radius},{lat},{lon});
        );
        out body;
        """
        logging.debug(f"Query for category '{category}': {query}")
        response = requests.post("https://overpass-api.de/api/interpreter", data=query)
        data = response.json()
        logging.debug(f"Response for category '{category}': {data}")
        count = len(data['elements'])
        stats_data[category] = count
    return stats_data

if __name__ == '__main__':
    app.run(debug=True)

