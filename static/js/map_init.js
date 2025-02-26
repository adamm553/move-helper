var mapElement = document.getElementById("map");
var lat = parseFloat(mapElement.getAttribute("data-lat"));
var lon = parseFloat(mapElement.getAttribute("data-lon"));

var myMap = L.map('map').setView([lat, lon], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(myMap);

L.marker([lat, lon]).addTo(myMap)
  .bindPopup('Twój adres')
  .openPopup();

window.myMap = myMap;
window.markersLayer = L.layerGroup().addTo(window.myMap);

