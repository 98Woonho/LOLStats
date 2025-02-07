const refreshBtn = document.getElementById('refreshBtn');

refreshBtn.addEventListener('click', function() {
    localStorage.clear();
    window.location.reload();
})