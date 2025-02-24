from flask import Flask, render_template, request
from data.voivodeships import wojewodztwa

app = Flask(__name__)

@app.route('/')
def index():
    if request.method == 'POST':
        wojewodztwo = request.form.get('wojewodztwo')
        miasto = request.form.get('miasto')
        ulica = request.form.get('ulica')
        numer = request.form.get('numer')
    return render_template('index.html', wojewodztwa=wojewodztwa)

if __name__ == '__main__':
    app.run(debug=True)