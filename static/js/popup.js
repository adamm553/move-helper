document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    var mapBtn = document.getElementById('map-btn');
    var statsBtn = document.getElementById('stats-btn');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            document.getElementById('popup').style.display = 'block';
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
            window.location.href = '/stats';
        });
    }
});