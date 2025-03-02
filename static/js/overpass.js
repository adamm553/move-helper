document.getElementById('find-btn').addEventListener('click', function() {
  var categories = Array.from(document.querySelectorAll('#kategoria input:checked')).map(input => input.value);
  var radiusKm = document.getElementById('radius').value;
  if (!radiusKm || isNaN(radiusKm)) {
    alert("Proszę podać poprawny promień (w kilometrach).");
    return;
  }
  var radius = parseFloat(radiusKm) * 1000;
  console.log("Wybrane kategorie:", categories, "Promień (w metrach):", radius);
  
  document.getElementById('loader-overlay').style.display = "flex";
  
  markersLayer.clearLayers(); 
  categories.forEach(category => fetchPOIs(category, radius));
});

document.getElementById('stats-btn').addEventListener('click', function() {
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

const categoryColors = {
  restaurant: 'red',
  school: 'blue',
  hospital: 'green',
  bar: 'purple',
  cafe: 'orange',
  place_of_worship: 'yellow',
  fast_food: 'pink',
  college: 'cyan',
  driving_school: 'magenta',
  kindergarten: 'lime',
  parking: 'brown',
  pharmacy: 'teal',
  casino: 'navy',
  cinema: 'maroon',
  courthouse: 'olive',
  fire_station: 'coral',
  police: 'gold'
};

function fetchPOIs(category, radius) {
  var center = window.myMap.getCenter();
  var query = `
    [out:json][timeout:25];
    (
      node["amenity"="${category}"](around:${radius},${center.lat},${center.lng});
      way["amenity"="${category}"](around:${radius},${center.lat},${center.lng});
      relation["amenity"="${category}"](around:${radius},${center.lat},${center.lng});
    );
    out center;
  `;
  
  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
  .then(response => response.text())
  .then(text => {
    try {
      var data = JSON.parse(text);
      
      var resultsTableBody = document.querySelector("#results-table tbody");

      var results = data.elements.map(function(element) {
        var elLat, elLon;
        if (element.type === "node") {
          elLat = element.lat;
          elLon = element.lon;
        } else if (element.center) {
          elLat = element.center.lat;
          elLon = element.center.lon;
        }
        if (elLat && elLon) {
          var popupText = (element.tags && element.tags.name) 
            ? element.tags.name 
            : (category.charAt(0).toUpperCase() + category.slice(1));
          var distance = calculateDistance(center.lat, center.lng, elLat, elLon);
          return {
            name: popupText,
            category: category,
            coordinates: `${elLat.toFixed(5)}, ${elLon.toFixed(5)}`,
            distance: distance,
            lat: elLat,
            lon: elLon
          };
        }
      }).filter(Boolean);

      results.sort(function(a, b) {
        return a.distance - b.distance;
      });

      results.forEach(function(result) {
        L.circleMarker([result.lat, result.lon], {
          color: categoryColors[result.category] || 'black',
          radius: 8
        }).addTo(markersLayer)
          .bindPopup(result.name);

        var row = resultsTableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.textContent = result.name;
        cell2.textContent = result.category;
        cell3.textContent = result.coordinates;
        cell4.textContent = (result.distance / 1000).toFixed(2) + " km";
      });
      
      document.getElementById('loader-overlay').style.display = "none";
      
    } catch (e) {
      console.error("Błąd podczas parsowania danych:", e);
      console.error("Otrzymany tekst:", text);
      document.getElementById('loader').style.display = "none";
    }
  })
  .catch(error => {
    console.error("Błąd podczas pobierania danych:", error);
    document.getElementById('loader').style.display = "none";
  });
}

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

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; 
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lat2 - lon1) * Math.PI / 180;
  var a = 
    0.5 - Math.cos(dLat)/2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}
