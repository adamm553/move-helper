document.getElementById('find-btn').addEventListener('click', function() {
  var category = document.getElementById('kategoria').value;
  var radiusKm = document.getElementById('radius').value;
  if (!radiusKm || isNaN(radiusKm)) {
    alert("Proszę podać poprawny promień (w kilometrach).");
    return;
  }
  var radius = parseFloat(radiusKm) * 1000;
  console.log("Wybrana kategoria:", category, "Promień (w metrach):", radius);
  
  document.getElementById('loader-overlay').style.display = "flex";
  
  fetchPOIs(category, radius);
});

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
      markersLayer.clearLayers(); 
      
      var resultsTableBody = document.querySelector("#results-table tbody");
      resultsTableBody.innerHTML = ""; // Wyczyść poprzednie wyniki

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

      // Sortuj wyniki według odległości
      results.sort(function(a, b) {
        return a.distance - b.distance;
      });

      results.forEach(function(result) {
        L.marker([result.lat, result.lon]).addTo(markersLayer)
          .bindPopup(result.name);

        // Dodaj wynik do tabeli
        var row = resultsTableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.textContent = result.name;
        cell2.textContent = result.category;
        cell3.textContent = result.coordinates;
        cell4.textContent = result.distance.toFixed(2);
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

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Promień Ziemi w km
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = 
    0.5 - Math.cos(dLat)/2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}
