// Pobieramy współrzędne z atrybutów elementu #map
var mapElement = document.getElementById("map");
var lat = parseFloat(mapElement.getAttribute("data-lat"));
var lon = parseFloat(mapElement.getAttribute("data-lon"));

// Inicjalizacja mapy
var myMap = L.map('map').setView([lat, lon], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(myMap);

// Dodanie markera głównego adresu
L.marker([lat, lon]).addTo(myMap)
  .bindPopup('Tutaj jest adres')
  .openPopup();

// Udostępniamy mapę globalnie
window.myMap = myMap;
