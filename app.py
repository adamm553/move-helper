from flask import Flask, render_template, request, redirect, url_for
import requests


app = Flask(__name__)

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
            return redirect(url_for('show_map', lat=lat, lon=lon))
        else:
            return "Nie znaleziono lokalizacji dla podanego adresu.", 404
    return render_template('index.html')

@app.route('/map')
def show_map():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    return render_template('map.html', lat=lat, lon=lon)

if __name__ == '__main__':
    app.run(debug=True)

    