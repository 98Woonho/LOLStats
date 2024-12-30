function searchPlayer() {
    const playerName = encodeURIComponent(document.getElementById('playerName').value);

    location.href = `/profile/overview?playerName=${playerName}`;
}