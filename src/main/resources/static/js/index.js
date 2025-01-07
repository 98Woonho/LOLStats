function searchPlayer() {
    const summonerName = encodeURIComponent(document.getElementById('summonerName').value);

    location.href = `/summoners/${summonerName}`;
}