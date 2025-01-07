const runesJsonUrl = '/json/runes.json';

document.addEventListener('DOMContentLoaded', async function() {
    const summonerName = encodeURIComponent( document.getElementById('summonerName').innerText);

    try {
        const response = await axios.get('/api/puuId?summonerName=' + summonerName);
        const puuid = response.data.puuid;
        console.log(puuid);

        try {
            const response = await axios.get('/api/matchList?puuid=' + puuid);
            const matchList = response.data;
            console.log(response.data);

            try {
                const response = await axios.get('/api/match?matchId=' + matchList[1]);
                const info = response.data.info;
                console.log(info);

                // 게임 시작 시간
                const gameCreation = new Date(info.gameCreation);
                console.log("게임 시작 시간 : " + gameCreation.toLocaleString());

                // 타임 스탬프
                const currentTime = new Date();
                const timeStamp = currentTime.getTime() - info.gameCreation;

                const days = Math.floor(timeStamp / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeStamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeStamp % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeStamp % (1000 * 60)) / 1000);
                console.log(`시간 차이: ${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);

                // 게임 지속 시간
                const gameDuration = info.gameDuration;
                const hour = Math.floor(gameDuration / 3600);
                const minute = Math.floor((gameDuration % 3600) / 60);
                const second = gameDuration % 60;
                console.log("게임 지속 시간 : " + hour + "시간 " + minute + "분 " + second + "초");


                /** QueueId
                 * 400, 430 : 일반 게임(소환사의 협곡)
                 * 420 : 랭크 게임(솔로/듀오)
                 * 440 : 랭크 게임(자유랭크)
                 * 450 : 무작위 총력전(칼바람 나락)
                 * 900, 1010 : URF 모드
                 * 830 : AI 상대 게임(초급 봇)
                 * 840 : AI 상대 게임(중급 봇)
                 * 850 : AI 상대 게임(숙련 봇)
                 */
                const queueId = info.queueId;
                console.log("큐 id : " + queueId);

                // 게임 참가자 정보 배열
                const participants = info.participants;

                // 내 정보

                const participant = participants[0];

                console.log("kills : " + participant.kills); // 킬 수
                console.log("deaths : " + participant.deaths); // 데스 수
                console.log("assists : " + participant.assists); // 어시스트 수
                console.log("totalMinionsKilled : " + participant.totalMinionsKilled); // 미니언 킬 수


                // Champion Square Assets : https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/<챔피언이름>.png
                console.log("championName : " + participant.championName); // 챔피언 이름

                // Item Square Assets : https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/<itemId>.png
                // 아이템 정보
                console.log("item0 : " + participant.item0);
                console.log("item1 : " + participant.item1);
                console.log("item2 : " + participant.item2);
                console.log("item3 : " + participant.item3);
                console.log("item4 : " + participant.item4);
                console.log("item5 : " + participant.item5);
                console.log("item6 : " + participant.item6);

                console.log("summonerName : " + participant.summonerName); // 소환사 이름
                console.log("riotIdTagline : " + participant.riotIdTagline); // 태그 이름
                console.log("summonerLevel : " + participant.summonerLevel); // 소환사 레벨

                // 소환사 스펠
                console.log("summoner1Id : " + participant.summoner1Id);
                console.log("summoner2Id : " + participant.summoner2Id);

                // 소환사 룬 정보
                const perks = participant.perks;
                const perksStyles = perks.styles;
                const primaryPerkStyleId = perksStyles[0].style; // 주 룬의 스타일 id
                const primaryPerkId = perksStyles[0].selections[0].perk; // 주 룬 id
                const subPerkStyleId = perksStyles[1].style; // 서브 룬의 스타일 id

                console.log("primaryPerkId : " + primaryPerkId);
                console.log("subPerkStyleId : " + subPerkStyleId);

                // runes.json 데이터 가져오기
                fetch(runesJsonUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch JSON data');
                        }
                        return response.json();
                    })
                    .then(runes => {
                        // 주 룬 이미지 주소 가져오기
                        const primaryRuneInfos = runes.find(rune => rune.id === primaryPerkStyleId); // 주 룬 정보 전체 가져오기
                        const primaryRuneInfo = primaryRuneInfos.slots[0].runes.find(rune => rune.id === primaryPerkId); // 유저의 주 룬 id와 같은 룬 정보 가져오기

                        const primaryRuneIconUrl = 'https://ddragon.leagueoflegends.com/cdn/img/' + primaryRuneInfo.icon; // 주 룬 아이콘 경로


                        // 서브 룬 이미지 주소 가져오기
                        const subRuneInfo = runes.find(rune => rune.id === subPerkStyleId);

                        const subRuneIconUrl = 'https://ddragon.leagueoflegends.com/cdn/img/' + subRuneInfo.icon; // 서브 룬 아이콘 경로
                    })

                const matchInfo = DOMParser().parseFromString(
                    ``, 'text/html')
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