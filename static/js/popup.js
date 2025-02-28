document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    document.getElementById('popup').style.display = 'block';
});

document.getElementById('map-btn').addEventListener('click', function() {
    document.querySelector('form').submit();
});

document.getElementById('stats-btn').addEventListener('click', function() {
    window.location.href = '/stats';
});
