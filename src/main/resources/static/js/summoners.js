const runesJsonUrl = '/json/runes.json';
const spellsJsonUrl = '/json/spells.json';
const version = '15.1.1';

document.addEventListener('DOMContentLoaded', async function () {
        const summonerName = document.getElementById('summonerName').innerText;
        const encodedSummonerName = encodeURIComponent(summonerName);

        // 매치 상세 정보 버튼 클릭 이벤트 추가(나중에 DOM parser에 작성해야 함)
        const matches = document.querySelectorAll('.match');
        const detailInfos = document.querySelectorAll('.match-detail');

        matches.forEach((match, index) => {
            const detailInfoBtn = match.querySelector('.match-detail-btn');

            detailInfoBtn.addEventListener('click', function () {
                detailInfos[index].classList.toggle('opened');
            })
        })

        try {
            const response = await axios.get('/api/puuId?summonerName=' + encodedSummonerName);
            const puuid = response.data.puuid;
            console.log(puuid);

            try {
                const matchListData = await getMatchListData(puuid);
                const matchList = matchListData.matchList;
                console.log(matchListData.matchList);

                try {
                        const response = await axios.get('/api/match?matchId=' + matchList[1]);

                        const info = response.data.info;
                        console.log(info);

                        // 타임 스탬프
                        const currentTime = new Date();
                        let timeStamp = currentTime.getTime() - info.gameCreation;

                        const days = Math.floor(timeStamp / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((timeStamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((timeStamp % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((timeStamp % (1000 * 60)) / 1000);

                        if (days !== 0) {
                            timeStamp = `${days}일 전`;
                        } else if (hours !== 0) {
                            timeStamp = `${hours}시간 전`;
                        } else if (minutes !== 0) {
                            timeStamp = `${minutes}분 전`;
                        } else if (seconds !== 0) {
                            timeStamp = `${seconds}초 전`;
                        } else {
                            timeStamp = '방금 전';
                        }

                        // 게임 지속 시간
                        const gameDuration = info.gameDuration;
                        const gameDurationHours = Math.floor(gameDuration / 3600);
                        const gameDurationMinutes = Math.floor((gameDuration % 3600) / 60);
                        const gameDurationSeconds = gameDuration % 60;

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

                        // queueId에 따른 queueType
                        const queueTypes = {
                            400: '일반',
                            430: '일반',
                            420: '개인/2인 랭크 게임',
                            440: '자유 랭크 게임',
                            450: '무작위 총력전',
                            900: 'U.R.F',
                            1010: 'U.R.F',
                            830: '초급 봇',
                            840: '중급 봇',
                            850: '숙련 봇'
                        };

                        const queueType = queueTypes[queueId] || '알 수 없는 게임 모드';

                        // 게임 참가자 정보 배열
                        const participants = info.participants;

                        // 내 정보
                        const myInfo = participants.find(participant => summonerName === participant.riotIdGameName
                            + '#' + participant.riotIdTagline);

                        // 내 팀 Id
                        const myTeamId = myInfo.teamId;

                        // 내 팀
                        const myTeam = info.teams.find(team => team.teamId === myTeamId);

                        // 내 팀 오브젝트 객체
                        const myTeamObjectives = myTeam.objectives;

                        // 적 팀
                        const enemyTeam = info.teams.find(team => team.teamId !== myTeamId);

                        // 적 팀 오브젝트 객체
                        const enemyTeamObjectives = enemyTeam.objectives;

                        // 내 승패 여부
                        const isWin = myTeam.win;

                        // 내 팀 참가자들
                        const myTeamParticipants = participants.filter(participant => participant.teamId === myTeamId);

                        // 내 팀의 총 킬
                        let myTeamTotalKills = 0;
                        for (const participant of myTeamParticipants) {
                            myTeamTotalKills += participant.kills;
                        }

                        // 내 팀의 총 골드
                        let myTeamTotalGold = 0;
                        for (const participant of myTeamParticipants) {
                            myTeamTotalGold += participant.goldEarned;
                        }

                        // 적 팀 참가자들
                        const enemyTeamParticipants = participants.filter(participant => participant.teamId !== myTeamId);

                        // 적 팀의 총 킬
                        let enemyTeamTotalKills = 0;
                        for (const participant of enemyTeamParticipants) {
                            enemyTeamTotalKills += participant.kills;
                        }

                        // 내 팀의 총 골드
                        let enemyTeamTotalGold = 0;
                        for (const participant of enemyTeamParticipants) {
                            enemyTeamTotalGold += participant.goldEarned;
                        }

                        const participant = participants[0];

                        // console.log("kills : " + participant.kills); // 킬 수
                        // console.log("deaths : " + participant.deaths); // 데스 수
                        // console.log("assists : " + participant.assists); // 어시스트 수
                        // console.log("totalMinionsKilled : " + participant.totalMinionsKilled); // 미니언 킬 수
                        //
                        // console.log("totalDamageDealtToChampions : " + participant.totalDamageDealtToChampions); // 챔피언에게 입힌 데미지
                        //
                        // console.log("totalDamageTaken : " + participant.totalDamageTaken
                        // ); // 챔피언에게 받은 데미지
                        //
                        // console.log("goldEarned : " + participant.goldEarned); // 얻은 골드량
                        //
                        //
                        // // Champion Square Assets : https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/<챔피언이름>.png
                        // console.log("championName : " + participant.championName); // 챔피언 이름

                        // Item Square Assets : https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/<itemId>.png
                        // 아이템 정보

                        // 내 아이템
                        const myItem0 = myInfo.item0;
                        const myItem1 = myInfo.item1;
                        const myItem2 = myInfo.item2;
                        const myItem3 = myInfo.item3;
                        const myItem4 = myInfo.item4;
                        const myItem5 = myInfo.item5;
                        const myItem6 = myInfo.item6;

                        // console.log("summonerName : " + participant.riotIdGameName); // 소환사 이름
                        // console.log("riotIdTagline : " + participant.riotIdTagline); // 태그 이름
                        // console.log("summonerLevel : " + participant.summonerLevel); // 소환사 레벨

                        // 소환사 스펠
                        const summoner1Id = participant.summoner1Id;
                        const summoner2Id = participant.summoner2Id;

                        // 소환사 룬 정보
                        const perks = participant.perks;
                        const perksStyles = perks.styles;
                        const primaryPerkStyleId = perksStyles[0].style; // 주 룬의 스타일 id
                        const primaryPerkId = perksStyles[0].selections[0].perk; // 주 룬 id
                        const subPerkStyleId = perksStyles[1].style; // 서브 룬의 스타일 id

                        let spell1Img;
                        let spell2Img;

                        // spells.json 데이터 가져오기
                        try {
                            const response = await fetch(spellsJsonUrl);
                            if (!response.ok) {
                                throw new Error('Failed to fetch JSON data');
                            }

                            const spells = await response.json();

                            // 스펠 image 가져오기
                            spell1Img = spells.find(spell => parseInt(spell.key) === summoner1Id).image.full;
                            spell2Img = spells.find(spell => parseInt(spell.key) === summoner2Id).image.full;
                        } catch (error) {
                            console.log(error);
                        }

                        let primaryRuneUrl;
                        let subRuneUrl;

                        // runes.json 데이터 가져오기
                        try {
                            const response = await fetch(runesJsonUrl);
                            if (!response.ok) {
                                throw new Error('Failed to fetch JSON data');
                            }

                            const runes = await response.json();

                            // 주 룬 이미지 주소 가져오기
                            const primaryRuneInfos = runes.find(rune => rune.id === primaryPerkStyleId); // 주 룬 정보 전체 가져오기
                            const primaryRuneInfo = primaryRuneInfos.slots[0].runes.find(rune => rune.id === primaryPerkId); // 유저의 주 룬 id와 같은 룬 정보 가져오기

                            primaryRuneUrl = 'https://ddragon.leagueoflegends.com/cdn/img/' + primaryRuneInfo.icon; // 주 룬 이미지 경로


                            // 서브 룬 이미지 주소 가져오기
                            const subRuneInfo = runes.find(rune => rune.id === subPerkStyleId);

                            subRuneUrl = 'https://ddragon.leagueoflegends.com/cdn/img/' + subRuneInfo.icon; // 서브 룬 경로
                        } catch (error) {
                            console.log(error);
                        }


                        // 팀 전체 오브젝트
                        const objectives = info.teams[0].objectives;
                        const baron = objectives.baron.kills; // 바론 처치 수
                        const dragon = objectives.dragon.kills; // 드래곤 처치 수
                        const riftHerald = objectives.riftHerald.kills; // 협곡의 전령 처치 수
                        const horde = objectives.horde.kills; // 공허 유충 처치 수
                        const tower = objectives.tower.kills; // 타워 파괴 수
                        const inhibitor = objectives.inhibitor.kills; // 억제기 파괴 수


                        // HTML 생성
                        const matchInfo = new DOMParser().parseFromString(
                            `
                        <div class="match ${isWin ? "win" : "lose"}">
                            <div class="match-summary">
                                <div class="infos">
                                    <div class="game-info">
                                        <div>
                                            <p class="queue-type">${queueType}</p>
                                            <p class="time-stamp">${timeStamp}</p>
                                        </div>
                                        <div class="line"></div>
                                        <div>
                                            <p class="result">${isWin ? '승리' : '패배'}</p>
                                            <p class="game-duration-time">${gameDurationHours === 0 ? '' : gameDurationHours + '시간 '}${gameDurationMinutes === 0 ? '' : gameDurationMinutes + '분 '}${gameDurationSeconds === 0 ? '' : gameDurationSeconds + '초'}</p>
                                        </div>
                                    </div>
                                    <div class="my-info">
                                        <div class="build">
                                            <div class="champion">
                                                <p>${myInfo.champLevel}</p>
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${myInfo.championName}.png" alt="">
                                            </div>
                                            <div class="spells">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell1Img}"
                                             alt="">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell2Img}"
                                             alt="">
                                            </div>
                                            <div class="runes">
                                                <img class="primary-rune"
                                             src="${primaryRuneUrl}"
                                             alt="">
                                                <div class="sub-rune">
                                                    <img src="${subRuneUrl}"
                                                 alt="">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="items">
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${myItem0}.png" alt="">
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${myItem1}.png" alt="">
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${myItem2}.png" alt="">
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${myItem3}.png" alt="">
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${myItem4}.png" alt="">
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${myItem5}.png" alt="">
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${myItem6}.png" alt="">
                                        </div>
                                    </div>
                                    <div class="stat-info">
                                        <div>
                                            <p class="label">K / D / A</p>
                                            <p class="kda value">
                                                <span>${myInfo.kills}</span>&thinsp;/&thinsp;<span class="d">${myInfo.deaths}</span>&thinsp;/&thinsp;<span>${myInfo.assists}</span></p>
                                        </div>
                                        <div>
                                            <p class="label">KA / D</p>
                                            <p class="kda-avg value">${Math.round(((myInfo.kills + myInfo.assists) / myInfo.deaths) * 100) / 100}</p>
                                        </div>
                                        <div>
                                            <p class="label">CS</p>
                                            <p class="cs value">${myInfo.totalMinionsKilled}</p>
                                        </div>
                                    </div>
                                </div>
                                <button class="match-detail-btn">
                                    <img src="${isWin ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAgUlEQVR4nGNgGAUM9fX/mTwb7+/2aLxnT2xwgNR6NdzfA9LLAAJeDQ+mezXc/0KMIVDNX0B6EKL//zN6NjyY6tl4/6tn/QMnnJrrH9p4Nd7/7Nl4fw7cdmINwa+ZgCHEacZhCGmaUQy5PxMSWPe/gNggMQaSwH+wId0gTLpmhhEFAAbtdmICvXslAAAAAElFTkSuQmCC" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAf0lEQVR4nO2QQQqDUAxEp72UM1AoeD3XRQRvUg+SeA11/UsUxI3t/+s6kE3Ie4EBriABd5PeI/nMrSNunRyCRcSk1qU5R7LC0hzMvkzAzcmXSYtJ9RlsVfVwcnKp37/nSr7CvyRZ8JmkCD5KjOyirLUwsosdSpI2SRNTDOO/8gHlO1mTtYIXXgAAAABJRU5ErkJggg=="}" alt="expand-arrow--v1">
                                </button>
                            </div>
                            <div class="match-detail opened">
                                <table class="${isWin ? "win" : "lose"}">
                                    <colgroup>
                                        <col width="90">
                                        <col width="90">
                                        <col width="50">
                                        <col width="130">
                                        <col width="48">
                                        <col width="56">
                                        <col width="155">
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th colspan="2"><span class="result">${isWin ? "승리" : "패배"}</span> ${myTeamId === 100 ? "(블루팀)" : "(레드팀)"}</th>
                                            <th>KDA</th>
                                            <th>피해량</th>
                                            <th>와드</th>
                                            <th>CS</th>
                                            <th>아이템</th>
                                        </tr>
                                    </thead>
                                </table>
                                <div class="summary">
                                    <div class="objectives ${isWin ? "win" : "lose"}">
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4L10 0L16 4L14 8L11 16L10 15H6L5 16L2 8L0 4L6 0L4 4L5 5H7L8 4L9 5H11L12 4ZM7 8C7 7.44695 7.4481 7 8 7C8.55284 7 9 7.44695 9 8C9 8.55211 8.55284 9 8 9C7.4481 9 7 8.55211 7 8ZM9 10C9 9.4481 9.44716 9 10 9C10.5528 9 11 9.4481 11 10C11 10.5519 10.5528 11 10 11C9.44716 11 9 10.5519 9 10ZM8 11C7.4481 11 7 11.4479 7 12C7 12.5531 7.4481 13 8 13C8.55284 13 9 12.5531 9 12C9 11.4479 8.55284 11 8 11ZM5 10C5 9.4481 5.44789 9 6 9C6.55211 9 7 9.4481 7 10C7 10.5519 6.55211 11 6 11C5.44789 11 5 10.5519 5 10Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${myTeamObjectives.baron.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0L6 4L3 1V5H0L3 8V11L7 16H9L13 11V8L16 5H13V1L10 4L8 0ZM9 10.9999L10 8.99993L12 7.99993L11 9.99993L9 10.9999ZM4 7.99993L5 9.99993L7 10.9999L6 8.99993L4 7.99993Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${myTeamObjectives.dragon.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.87931 12.3184H8.01691C11.0876 12.0307 11.1112 8.63778 11.1112 8.63778C11.134 5.80836 8.07153 6.04968 7.94776 6.06005C7.82468 6.04968 4.76224 5.80836 4.78506 8.63778C4.78506 8.63778 4.80788 12.0307 7.87931 12.3184ZM11.2377 1C11.2377 1 15.6775 3.57635 14.9874 8.84453C14.9874 8.84453 12.94 9.18956 12.8253 10.7308C12.8253 10.7308 11.9741 14.1127 8.06323 14.2503H7.92909C4.01824 14.1127 3.16706 10.7308 3.16706 10.7308C3.05228 9.18956 1.0042 8.84453 1.0042 8.84453C0.314127 3.57635 4.75463 1 4.75463 1C3.5356 4.58864 4.91574 5.25589 4.91574 5.25589C6.00547 4.45104 7.04127 4.16063 7.94776 4.13574V4.13159C7.95571 4.13159 7.96384 4.13211 7.97196 4.13262C7.98009 4.13314 7.98821 4.13366 7.99616 4.13366C8.0042 4.13366 8.01242 4.13313 8.02055 4.13261C8.02849 4.13209 8.03635 4.13159 8.04387 4.13159V4.13574C8.95106 4.16063 9.98616 4.45104 11.0766 5.25589C11.0766 5.25589 12.4567 4.58864 11.2377 1ZM6.95885 9.17476C6.95885 8.01382 7.42212 7.07344 7.99326 7.07344C8.5644 7.07344 9.02698 8.01382 9.02698 9.17476C9.02698 10.335 8.5644 11.2754 7.99326 11.2754C7.42212 11.2754 6.95885 10.335 6.95885 9.17476ZM14.2859 11.3866C14.2859 11.3866 13.5723 14.9524 13.2273 15.3438C13.2273 15.3438 14.7685 15.3666 16 12.9859C16 12.9859 15.5049 11.9391 14.2859 11.3866ZM2.77203 15.3434C2.77203 15.3434 1.23079 15.3662 0 12.9856C0 12.9856 0.494388 11.9387 1.71411 11.3862C1.71411 11.3862 2.427 14.9521 2.77203 15.3434Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${myTeamObjectives.riftHerald.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.99998 1L6.33333 2.42045C6.33333 2.42045 5.46216 3.2176 5.18153 3.2176H3.92809C3.00001 3.2176 1.66668 4.196 1.37128 5.89721C1.29668 6.32667 1.27273 7.18045 1.93119 8.06625L1 8.81245C1 8.81245 2.33331 9.52267 2.66665 10.9431C2.99998 12.3636 5.08806 13.7042 6.90051 14.0875L7.98099 14.969V15L7.99998 14.9845L8.01896 15V14.969L9.09944 14.0875C10.9119 13.7042 13 12.3636 13.3333 10.9431C13.6666 9.52267 15 8.81245 15 8.81245L14.0688 8.06625C14.7272 7.18045 14.7056 6.34035 14.6287 5.89721C14.3333 4.196 13 3.2176 12.0719 3.2176H10.8184C10.5378 3.2176 9.66667 2.42045 9.66667 2.42045L7.99998 1ZM8.1486 4.2451C8.06916 4.15686 7.93078 4.15686 7.85134 4.2451L5.43358 6.93049C5.35687 7.0157 5.36687 7.14765 5.45522 7.22073C5.72968 7.44776 6.27298 7.90668 6.46151 8.13439C6.67259 8.38935 5.14596 9.53934 4.59964 9.93794C4.50018 10.0105 4.48826 10.1542 4.57436 10.2422L6.41356 12.1222C6.49201 12.2024 6.62105 12.2024 6.69949 12.1222L7.857 10.9391C7.93545 10.8589 8.06449 10.8589 8.14293 10.9391L9.30045 12.1222C9.37889 12.2024 9.50793 12.2024 9.58637 12.1222L11.4256 10.2422C11.5117 10.1542 11.4998 10.0105 11.4003 9.93794C10.854 9.53934 9.32734 8.38935 9.53843 8.13439C9.72695 7.90668 10.2703 7.44776 10.5447 7.22073C10.6331 7.14765 10.6431 7.0157 10.5664 6.93049L8.1486 4.2451Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${myTeamObjectives.horde.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 4L8 0L11.9992 4L10.9982 5.0012L11 5H14L8 11L2 5H5L4 4ZM6.4 3.99963L8 2.4L9.6 3.99963L8 5.6L6.4 3.99963ZM8 12L12 8L10 16H6L4 8L8 12Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${myTeamObjectives.tower.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="rgb(232, 64, 87)"></path>
                                                <rect x="8" y="4" width="5.65694" height="5.65694" transform="rotate(45 8 4)" fill="rgb(232, 64, 87)"></rect>
                                            </svg>
                                            <p>${myTeamObjectives.inhibitor.kills}</p>
                                        </div>
                                    </div>
                                    <div class="graph">
                                        <div class="total total-kill">
                                            <div class="value">
                                                <p>${myTeamTotalKills}</p>
                                                <p>Total Kill</p>
                                                <p>${enemyTeamTotalKills}</p>
                                            </div>
                                            <div style="width: ${Math.round ((myTeamTotalKills * 100 / (myTeamTotalKills + enemyTeamTotalKills)) * 100) / 100}%; height: 100%; background-color: #E84057"></div>
                                            <div style="width: ${Math.round ((enemyTeamTotalKills * 100 / (myTeamTotalKills + enemyTeamTotalKills)) * 100) / 100}%; height: 100%; background-color: #5383E8"></div>
                                        </div>
                                        <div class="total total-gold">
                                            <div class="value">
                                                <p>${myTeamTotalGold}</p>
                                                <p>Total Gold</p>
                                                <p>${enemyTeamTotalGold}</p>
                                            </div>
                                            <div style="width: ${Math.round ((myTeamTotalGold * 100 / (myTeamTotalGold + enemyTeamTotalGold)) * 100) / 100}%; height: 100%; background-color: #E84057"></div>
                                            <div style="width: ${Math.round ((enemyTeamTotalGold * 100 / (myTeamTotalGold + enemyTeamTotalGold)) * 100 / 100)}%; height: 100%; background-color: #5383E8"></div>
                                        </div>
                                    </div>
                                    <div class="objectives ${!isWin ? "win" : "lose"}">
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4L10 0L16 4L14 8L11 16L10 15H6L5 16L2 8L0 4L6 0L4 4L5 5H7L8 4L9 5H11L12 4ZM7 8C7 7.44695 7.4481 7 8 7C8.55284 7 9 7.44695 9 8C9 8.55211 8.55284 9 8 9C7.4481 9 7 8.55211 7 8ZM9 10C9 9.4481 9.44716 9 10 9C10.5528 9 11 9.4481 11 10C11 10.5519 10.5528 11 10 11C9.44716 11 9 10.5519 9 10ZM8 11C7.4481 11 7 11.4479 7 12C7 12.5531 7.4481 13 8 13C8.55284 13 9 12.5531 9 12C9 11.4479 8.55284 11 8 11ZM5 10C5 9.4481 5.44789 9 6 9C6.55211 9 7 9.4481 7 10C7 10.5519 6.55211 11 6 11C5.44789 11 5 10.5519 5 10Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${enemyTeamObjectives.baron.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0L6 4L3 1V5H0L3 8V11L7 16H9L13 11V8L16 5H13V1L10 4L8 0ZM9 10.9999L10 8.99993L12 7.99993L11 9.99993L9 10.9999ZM4 7.99993L5 9.99993L7 10.9999L6 8.99993L4 7.99993Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${enemyTeamObjectives.dragon.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.87931 12.3184H8.01691C11.0876 12.0307 11.1112 8.63778 11.1112 8.63778C11.134 5.80836 8.07153 6.04968 7.94776 6.06005C7.82468 6.04968 4.76224 5.80836 4.78506 8.63778C4.78506 8.63778 4.80788 12.0307 7.87931 12.3184ZM11.2377 1C11.2377 1 15.6775 3.57635 14.9874 8.84453C14.9874 8.84453 12.94 9.18956 12.8253 10.7308C12.8253 10.7308 11.9741 14.1127 8.06323 14.2503H7.92909C4.01824 14.1127 3.16706 10.7308 3.16706 10.7308C3.05228 9.18956 1.0042 8.84453 1.0042 8.84453C0.314127 3.57635 4.75463 1 4.75463 1C3.5356 4.58864 4.91574 5.25589 4.91574 5.25589C6.00547 4.45104 7.04127 4.16063 7.94776 4.13574V4.13159C7.95571 4.13159 7.96384 4.13211 7.97196 4.13262C7.98009 4.13314 7.98821 4.13366 7.99616 4.13366C8.0042 4.13366 8.01242 4.13313 8.02055 4.13261C8.02849 4.13209 8.03635 4.13159 8.04387 4.13159V4.13574C8.95106 4.16063 9.98616 4.45104 11.0766 5.25589C11.0766 5.25589 12.4567 4.58864 11.2377 1ZM6.95885 9.17476C6.95885 8.01382 7.42212 7.07344 7.99326 7.07344C8.5644 7.07344 9.02698 8.01382 9.02698 9.17476C9.02698 10.335 8.5644 11.2754 7.99326 11.2754C7.42212 11.2754 6.95885 10.335 6.95885 9.17476ZM14.2859 11.3866C14.2859 11.3866 13.5723 14.9524 13.2273 15.3438C13.2273 15.3438 14.7685 15.3666 16 12.9859C16 12.9859 15.5049 11.9391 14.2859 11.3866ZM2.77203 15.3434C2.77203 15.3434 1.23079 15.3662 0 12.9856C0 12.9856 0.494388 11.9387 1.71411 11.3862C1.71411 11.3862 2.427 14.9521 2.77203 15.3434Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${enemyTeamObjectives.riftHerald.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.99998 1L6.33333 2.42045C6.33333 2.42045 5.46216 3.2176 5.18153 3.2176H3.92809C3.00001 3.2176 1.66668 4.196 1.37128 5.89721C1.29668 6.32667 1.27273 7.18045 1.93119 8.06625L1 8.81245C1 8.81245 2.33331 9.52267 2.66665 10.9431C2.99998 12.3636 5.08806 13.7042 6.90051 14.0875L7.98099 14.969V15L7.99998 14.9845L8.01896 15V14.969L9.09944 14.0875C10.9119 13.7042 13 12.3636 13.3333 10.9431C13.6666 9.52267 15 8.81245 15 8.81245L14.0688 8.06625C14.7272 7.18045 14.7056 6.34035 14.6287 5.89721C14.3333 4.196 13 3.2176 12.0719 3.2176H10.8184C10.5378 3.2176 9.66667 2.42045 9.66667 2.42045L7.99998 1ZM8.1486 4.2451C8.06916 4.15686 7.93078 4.15686 7.85134 4.2451L5.43358 6.93049C5.35687 7.0157 5.36687 7.14765 5.45522 7.22073C5.72968 7.44776 6.27298 7.90668 6.46151 8.13439C6.67259 8.38935 5.14596 9.53934 4.59964 9.93794C4.50018 10.0105 4.48826 10.1542 4.57436 10.2422L6.41356 12.1222C6.49201 12.2024 6.62105 12.2024 6.69949 12.1222L7.857 10.9391C7.93545 10.8589 8.06449 10.8589 8.14293 10.9391L9.30045 12.1222C9.37889 12.2024 9.50793 12.2024 9.58637 12.1222L11.4256 10.2422C11.5117 10.1542 11.4998 10.0105 11.4003 9.93794C10.854 9.53934 9.32734 8.38935 9.53843 8.13439C9.72695 7.90668 10.2703 7.44776 10.5447 7.22073C10.6331 7.14765 10.6431 7.0157 10.5664 6.93049L8.1486 4.2451Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${enemyTeamObjectives.horde.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 4L8 0L11.9992 4L10.9982 5.0012L11 5H14L8 11L2 5H5L4 4ZM6.4 3.99963L8 2.4L9.6 3.99963L8 5.6L6.4 3.99963ZM8 12L12 8L10 16H6L4 8L8 12Z" fill="rgb(232, 64, 87)"></path>
                                            </svg>
                                            <p>${enemyTeamObjectives.tower.kills}</p>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="rgb(232, 64, 87)">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="rgb(232, 64, 87)"></path>
                                                <rect x="8" y="4" width="5.65694" height="5.65694" transform="rotate(45 8 4)" fill="rgb(232, 64, 87)"></rect>
                                            </svg>
                                            <p>${enemyTeamObjectives.inhibitor.kills}</p>
                                        </div>
                                    </div>
                                </div>
                                <table class="${!isWin ? "win" : "lose"}">
                                    <colgroup>
                                        <col width="90">
                                        <col width="90">
                                        <col width="50">
                                        <col width="130">
                                        <col width="48">
                                        <col width="56">
                                        <col width="155">
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th colspan="2"><span class="result">${!isWin ? "승리" : "패배"}</span> ${myTeamId !== 100 ? "(블루팀)" : "(레드팀)"}</th>
                                            <th>KDA</th>
                                            <th>피해량</th>
                                            <th>와드</th>
                                            <th>CS</th>
                                            <th>아이템</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    `, 'text/html');

                        console.log(matchInfo.querySelector('.match'));

                        const contentRight = document.querySelector('.content-right');
                        contentRight.appendChild(matchInfo.querySelector('.match'));
                    // }
                } catch (error) {
                    console.log(error.response.data.status);
                }

            } catch (error) {
                console.log(error.response.data.status);
            }

        } catch (error) {
            console.log(error.response.data.status);
        }
    }
)

// matchList를 가져오는 함수
async function getMatchListData(puuid) {
    const lastMatchListData = localStorage.getItem(puuid);

    if (lastMatchListData) {
        return JSON.parse(lastMatchListData);
    }

    try {
        const response = await axios.get('/api/matchList?puuid=' + puuid);
        const matchList = response.data;

        const matchListData = {
            matchList, // 전적 데이터
            timestamp: new Date().toISOString(), // 저장한 시간 (ISO 형식)
        };

        // API로부터 데이터를 가져왔다면 localStorage에 저장
        localStorage.setItem(puuid, JSON.stringify(matchListData));

        return matchListData;
    } catch (error) {
        console.error('Error fetching matchList:', error);
        throw error; // 에러를 호출자에게 전달
    }
}