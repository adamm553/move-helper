// Tworzymy warstwę na nowe markery, aby móc je łatwo usuwać
var markersLayer = L.layerGroup().addTo(window.myMap);

function fetchPOIs(category, radius) {
  // Używamy środka mapy jako punktu odniesienia
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
      markersLayer.clearLayers(); // Czyścimy poprzednie markery
      
      data.elements.forEach(function(element) {
        var elLat, elLon;
        if (element.type === "node") {
          elLat = element.lat;
          elLon = element.lon;
        } else if (element.center) {
          elLat = element.center.lat;
          elLon = element.center.lon;
        }
        if (elLat && elLon) {
          L.marker([elLat, elLon]).addTo(markersLayer)
            .bindPopup(`${category.charAt(0).toUpperCase() + category.slice(1)}`);
        }
      });
    } catch (e) {
      console.error("Błąd podczas parsowania danych:", e);
      console.error("Otrzymany tekst:", text);
    }
  })
  .catch(error => console.error("Błąd podczas pobierania danych:", error));
}

// Obsługa przycisku "Znajdź pod promieniem"
document.getElementById('find-btn').addEventListener('click', function() {
  var category = document.getElementById('kategoria').value;
  var radiusKm = document.getElementById('radius').value;
  if (!radiusKm || isNaN(radiusKm)) {
    alert("Proszę podać poprawny promień (w kilometrach).");
    return;
  }
  // Przeliczamy kilometry na metry
  var radius = parseFloat(radiusKm) * 1000;
  console.log("Wybrana kategoria:", category, "Promień (w metrach):", radius);
  fetchPOIs(category, radius);
});
