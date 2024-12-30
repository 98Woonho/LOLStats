document.addEventListener("DOMContentLoaded", async function() {
    const url = new URL(window.location.href);
    const playerName = encodeURIComponent(url.searchParams.get("playerName"));

    try {
        const response = await axios.get('/api/getPUUID?playerName=' + playerName);
        const puuid = response.data.puuid;
        console.log(puuid);

        try {
            const response = await axios.get('/api/getMatchlists?puuid=' + puuid);
            console.log(response);
        } catch (error) {
            console.log(error.response.data.status);
        }

    } catch (error) {
        console.log(error.response.data.status);
    }
})
