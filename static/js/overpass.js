var markersLayer = L.layerGroup().addTo(window.myMap);

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
          var popupText = (element.tags && element.tags.name) 
            ? element.tags.name
            : (category.charAt(0).toUpperCase() + category.slice(1));
          L.marker([elLat, elLon]).addTo(markersLayer)
            .bindPopup(popupText);
        }
      });
    } catch (e) {
      console.error("Błąd podczas parsowania danych:", e);
      console.error("Otrzymany tekst:", text);
    }
  })
  .catch(error => console.error("Błąd podczas pobierania danych:", error));
}

document.getElementById('find-btn').addEventListener('click', function() {
  var category = document.getElementById('kategoria').value;
  var radiusKm = document.getElementById('radius').value;
  if (!radiusKm || isNaN(radiusKm)) {
    alert("Proszę podać poprawny promień (w kilometrach).");
    return;
  }
  var radius = parseFloat(radiusKm) * 1000;
  console.log("Wybrana kategoria:", category, "Promień (w metrach):", radius);
  fetchPOIs(category, radius);
});
