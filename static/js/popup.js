document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    var mapBtn = document.getElementById('map-btn');
    var statsBtn = document.getElementById('stats-btn');
    var popup = document.getElementById('popup');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            if (popup) {
                popup.style.display = 'block';
            }
        });
    }

    if (mapBtn) {
        mapBtn.addEventListener('click', function() {
            if (form) {
                form.submit();
            }
        });
    }

    if (statsBtn) {
        statsBtn.addEventListener('click', function() {
            var categories = Array.from(document.querySelectorAll('#kategoria input:checked')).map(input => input.value);
            var radiusKm = document.getElementById('radius').value;
            if (!radiusKm || isNaN(radiusKm)) {
                alert("Proszę podać poprawny promień (w kilometrach).");
                return;
            }
            var radius = parseFloat(radiusKm) * 1000;
            console.log("Wybrane kategorie:", categories, "Promień (w metrach):", radius);

            fetchStats(categories, radius);
        });
    }
});

function fetchStats(categories, radius) {
    var center = window.myMap.getCenter();
    var query = {
        categories: categories,
        radius: radius,
        lat: center.lat,
        lon: center.lng
    };

    fetch('/stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('chartImage').src = `data:image/png;base64,${data.chart}`;
            document.getElementById('chart-modal').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Błąd podczas pobierania danych:', error);
        alert('Wystąpił błąd podczas pobierania danych.');
    });
}