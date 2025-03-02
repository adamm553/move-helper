var modal = document.getElementById("chart-modal");
var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function showResultsModal(statsData, chart) {
    var resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    for (var category in statsData) {
        var li = document.createElement("li");
        li.textContent = category + ": " + statsData[category]; 
        resultsList.appendChild(li);
    }
    document.getElementById('chartImage').src = "data:image/png;base64," + chart;
    modal.style.display = "block";
}

document.getElementById('statsForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(this);
    fetch('/stats', {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showResultsModal(data.stats_data, data.chart);
    })
    .catch(error => console.error("Error:", error));    
}