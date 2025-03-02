from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import requests
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


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

@app.route('/stats', methods=['POST'])
def stats():
    data = request.get_json()
    categories = data.get('categories')
    radius = data.get('radius')
    lat = data.get('lat')
    lon = data.get('lon')

    if not categories or not radius or not lat or not lon:
        return jsonify(error="Brak wymaganych danych."), 400

    stats_data = fetch_stats(lat, lon, categories, radius)
    img = generate_chart(stats_data)
    return jsonify(stats_data=stats_data, chart=img)

def fetch_stats(lat, lon, categories, radius):
    stats_data = {}
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
        response = requests.post("https://overpass-api.de/api/interpreter", data=query)
        data = response.json()
        count = len(data['elements'])
        stats_data[category] = count
    return stats_data

def generate_chart(stats_data):
    categories = list(stats_data.keys())
    counts = list(stats_data.values())

    plt.figure(figsize=(10, 5))
    plt.bar(categories, counts, color='skyblue')
    plt.xlabel('Kategorie')
    plt.ylabel('Ilość')
    plt.title('Ilość danych kategorii w wybranym promieniu')
    plt.xticks(rotation=45, ha='right')

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img = base64.b64encode(buf.getvalue()).decode('utf-8')
    buf.close()

    return img

if __name__ == '__main__':
    app.run(debug=True)

