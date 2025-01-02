document.addEventListener("DOMContentLoaded", async function() {
    const url = new URL(window.location.href);
    const playerName = encodeURIComponent(url.searchParams.get("playerName"));

    try {
        const response = await axios.get('/api/puuId?playerName=' + playerName);
        const puuid = response.data.puuid;
        console.log(puuid);

        try {
            const response = await axios.get('/api/matchList?puuid=' + puuid);
            const matchList = response.data;
            console.log(response.data);

            try {
                for (const matchId of matchList) {
                    const response = await axios.get('/api/match?matchId=' + matchId);
                    console.log(response.data.info.gameMode);
                }

                // const response = await axios.get('/api/match?matchId=' + matchList[0]);
                // const info = response.data.info;
                // console.log(info);
                //
                // // 게임 시작 시간
                // const gameCreation = new Date(info.gameCreation);
                // console.log("게임 시작 시간 : " + gameCreation.toLocaleString());
                //
                // // 게임 지속 시간
                // const gameDuration = info.gameDuration;
                // const hour = Math.floor(gameDuration / 3600);
                // const minute = Math.floor((gameDuration % 3600) / 60);
                // const second = gameDuration % 60;
                // console.log("게임 지속 시간 : " + hour + "시간 " + minute + "분 " + second + "초");
                //
                // // 게임 종류
                // const gameMode = info.gameMode;


            } catch (error) {
                console.log(error.response.data.status);
            }

        } catch (error) {
            console.log(error.response.data.status);
        }

    } catch (error) {
        console.log(error.response.data.status);
    }
})
