const version = '15.3.1';
const main = document.getElementById('main');
const path = window.location.pathname; // 현재 path 가져오기
const parts = path.split("/");
const summonerName = decodeURIComponent(parts[2]); // summonerName 가져오기
const queueType = parts[3] // queueType 가져오기
const lastSummonerName = sessionStorage.getItem('lastSummonerName') || ''; // sessionStorage에서 lastSummonerName 값 가져오기
let start = 0;
let championStatsData = {}; // 챔피언 전적을 저장할 객체

const loadingContainer = new DOMParser().parseFromString(`
    <div id="loadingContainer" class="loading-container">
        <img class="icon" src="data:image/svg+xml; charset=utf-8;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgaWQ9IkxlYWd1ZU9mTGVnZW5kcyI+CiAgPHBhdGggZD0iTTM1LDM3LjEzQTE0LjM4LDE0LjM4LDAsMCwwLDI0LDEzLjQ2YTExLjUxLDExLjUxLDAsMCwwLTEuNDUuMVYxMC42OEgxMS44N2wyLjkyLDMuNTh2Mi41NmExNC4yOSwxNC4yOSwwLDAsMC0uMTgsMjJsLTMuMTIsMy41SDM0bDQuNjQtNS4xNlpNMjQsMTQuNjRBMTMuMjEsMTMuMjEsMCwwLDEsMzMuNCwzNy4xM0gzMS45NGExMi4yMSwxMi4yMSwwLDAsMC04LTIxLjQ5LDExLjY2LDExLjY2LDAsMCwwLTEuNDYuMTF2LTFBMTMuOTQsMTMuOTQsMCwwLDEsMjQsMTQuNjRabS0xLjQ3LDEuN0ExMS44MiwxMS44MiwwLDAsMSwyNCwxNi4yM2ExMS42MiwxMS42MiwwLDAsMSw3LDIwLjlIMjIuNDJaTTE0Ljg1LDM1LjA3YTExLjUzLDExLjUzLDAsMCwxLDAtMTQuMzRabS00LjExLTcuMTlhMTMuMTUsMTMuMTUsMCwwLDEsNC4wNi05LjQ5djEuNDJhMTIuMTQsMTIuMTQsMCwwLDAsMCwxNi4xOHYxLjQzQTEzLjE3LDEzLjE3LDAsMCwxLDEwLjc0LDI3Ljg4Wk0zMy41LDQxLjExSDE0LjEzTDE2LDM5LDE2LDEzLjg0bC0xLjYyLTJoN2wtLjEyLDI2LjQ1SDM2WiIgZmlsbD0iI2ZmZjlmOSIgY2xhc3M9ImNvbG9yMDAwMDAwIHN2Z1NoYXBlIj48L3BhdGg+Cjwvc3ZnPgo=" alt="">
    </div>
`, 'text/html').getElementById('loadingContainer'); // loadingContainer DOM

// sessionStorage의 lastSummonerName과 현재 페이지의 summonerName이 다르면 main 전체에 loadingContainer 창 띄우기
if (lastSummonerName !== summonerName) {
    main.appendChild(loadingContainer);
}

// 즉시 실행 함수
(async function () {
    try {
        // summonerName 파라미터 값에 #가 포함되어 있는지 검사
        if (!summonerName.includes('#')) {
            // #가 포함되어 있지 안으면 404 throw
            throw {response: {data: {status: 404, message: '소환사를 찾을 수 없습니다. 게임 이름과 태그를 다시 한 번 확인 후, 재시도 해주세요.'}}};
        }

        const encodedSummonerName = encodeURIComponent(summonerName);

        // 소환사 데이터 가져오기
        const summoner = await axios.get(`/summoners/${encodedSummonerName}`);

        // 소환사 랭크 정보 가져오기
        const ranks = await axios.get(`/lol/ranks?summonerId=${summoner.data.id}`);
        const soloRank = ranks.data.soloRank;
        const flexRank = ranks.data.flexRank;

        // 응답으로 온 gameName과 tagLine이 summonerName parameter와 같은지 검사
        const gameName = summonerName.split('#')[0];
        const tagLine = summonerName.split('#')[1];

        if (summoner.data.gameName !== gameName || summoner.data.tagLine !== tagLine) {
            // gameName과 tagLine중 하나라도 같지 않으면 404 throw
            throw {response: {data: {status: 404, message: '소환사를 찾을 수 없습니다. 게임 이름과 태그를 다시 한 번 확인 후, 재시도 해주세요.'}}};
        }

        const puuid = summoner.data.puuid;

        await saveRecentSearch(summonerName); // 로컬 스토리지의 recentSearches에 소환사 이름 저장

        const profileIconId = summoner.data.profileIconId;
        const summonerLevel = summoner.data.summonerLevel;

        // 갱신 시간 setting
        if (!localStorage.getItem(`renewTime_${summonerName}`)) {
            // localStorage에 renewTime이 없으면 현재 시각으로 set
            localStorage.setItem(`renewTime_${summonerName}`, JSON.stringify(new Date().getTime()));
        }

        const renewTime = localStorage.getItem(`renewTime_${summonerName}`); // 갱신 시간
        let renewTimeStamp = new Date().getTime() - renewTime; // 갱신 시간 스탬프

        const days = Math.floor(renewTimeStamp / (1000 * 60 * 60 * 24));
        const hours = Math.floor((renewTimeStamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((renewTimeStamp % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((renewTimeStamp % (1000 * 60)) / 1000);

        if (days !== 0) {
            renewTimeStamp = `${days}일 전`;
        } else if (hours !== 0) {
            renewTimeStamp = `${hours}시간 전`;
        } else if (minutes !== 0) {
            renewTimeStamp = `${minutes}분 전`;
        } else if (seconds !== 0) {
            renewTimeStamp = `${seconds}초 전`;
        } else {
            renewTimeStamp = '방금 전';
        }

        const summonerProfileContainer = new DOMParser().parseFromString(`
                <div class="summoner-profile-container">
                    <div class="summoner-profile">
                        <div class="profile-icon">
                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png" alt="">
                            <div class="summoner-level">${summonerLevel}</div>
                        </div>
                        <div class="profile-info">
                            <p class="summoner-name">${summonerName}</p>
                            <button class="renew-record-btn">전적 갱신</button>
                            <p class="renew-time">갱신 시간 : ${renewTimeStamp}</p>
                        </div>
                    </div> 
                </div>
                `, 'text/html').querySelector('.summoner-profile-container');

        const renewRecordBtn = summonerProfileContainer.querySelector('.renew-record-btn');

        // renewRecordBtn click event
        renewRecordBtn.addEventListener('click', function () {
            localStorage.setItem(`renewTime_${summonerName}`, JSON.stringify(new Date().getTime()));

            const prefix = `summonerData_${summonerName}_`;

            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            }

            window.location.reload();
        });

        if (lastSummonerName === summonerName) {
            main.appendChild(summonerProfileContainer);
            main.appendChild(loadingContainer);
        }

        let summonerStatsData = await axios.get(`/summonerStats?summonerId=${summoner.data.id}&queueType=${queueType}`);

        summonerStatsData = summonerStatsData.data === "" ? null : decodeURIComponent(summonerStatsData.data);

        const statsContainerHtml = summonerStatsData || `
            <div class="stats-container">
                <ul class="queue-type-container">
                    <li>
                        <a class="${queueType === 'ALL' ? 'selected' : ''}" href="/summoners/${encodedSummonerName}/ALL">전체</a>
                    </li>   
                    <li>
                        <a class="${queueType === 'SOLORANK' ? 'selected' : ''}" href="/summoners/${encodedSummonerName}/SOLORANK">개인/2인 랭크 게임</a>
                    </li>
                    <li>
                        <a class="${queueType === 'FLEXRANK' ? 'selected' : ''}" href="/summoners/${encodedSummonerName}/FLEXRANK">자유 랭크 게임</a>
                    </li>
                    <li>
                        <a class="${queueType === 'NORMAL' ? 'selected' : ''}" href="/summoners/${encodedSummonerName}/NORMAL">일반</a>
                    </li>
                    <li>
                        <a class="${queueType === 'ARAM' ? 'selected' : ''}" href="/summoners/${encodedSummonerName}/ARAM">무작위 총력전</a>
                    </li>
                </ul>
                <div class="content-container" id="contentContainer">
                    <div class="content-left">
                        ${queueType === 'ALL' || queueType === 'SOLORANK' ? `
                        <div class="rank-info">
                            <div class="header">개인/2인 랭크 게임</div>
                            <div class="content">
                                <img src="/images/rank-emblems/${soloRank.tier}.png" alt=""/>
                                <div class="tier-info">
                                    <p class="tier">${soloRank.tier}</p>
                                    ${soloRank.tier !== 'Unranked' ? `
                                    <p class="lp">${soloRank.leaguePoints} LP</p>` : ``}
                                </div>
                                ${soloRank.tier !== 'Unranked' ? `
                                <div class="win-lose-info">
                                    <p class="win-lose">${soloRank.wins}승 ${soloRank.losses}패</p>
                                    <p class="rate">${Math.round(soloRank.wins * 100 / (soloRank.wins + soloRank.losses))}%</p>
                                </div>` : ``}
                            </div>
                        </div>` : ``}
                        ${queueType === 'ALL' || queueType === 'FLEXRANK' ? `
                        <div class="rank-info">
                            <div class="header">자유 랭크 게임</div>
                            <div class="content">
                                <img src="/images/rank-emblems/${flexRank.tier}.png" alt=""/>
                                <div class="tier-info">
                                    <p class="tier">${flexRank.tier}</p>
                                    ${flexRank.tier !== 'Unranked' ? `
                                    <p class="lp">${flexRank.leaguePoints} LP</p>` : ``}
                                </div>
                                ${flexRank.tier !== 'Unranked' ? `
                                <div class="win-lose-info">
                                    <p class="win-lose">${flexRank.wins}승 ${flexRank.losses}패</p>
                                    <p class="rate">${Math.round(flexRank.wins * 100 / (flexRank.wins + flexRank.losses))}%</p>
                                </div>` : ``}
                            </div>
                        </div>` : ``}
                        <div class="champion-stats">
                            <div class="header">최근 플레이한 챔피언</div>
                        </div>
                    </div>
                    <div class="content-right">
                        <button class="load-more-matches-btn">Load More</button>
                    </div>
                </div>
            </div>`;

        const statsContainer = new DOMParser().parseFromString(statsContainerHtml, 'text/html').querySelector('.stats-container');

        const loadMoreMatchesBtn = statsContainer.querySelector('.load-more-matches-btn');
        const contentRight = statsContainer.querySelector('.content-right');
        const championStats = statsContainer.querySelector('.champion-stats');

        // loadMoreMatchesBtn click event
        if (loadMoreMatchesBtn) {
            loadMoreMatchesBtn.addEventListener('click', async function () {
                loadMoreMatchesBtn.replaceChildren();
                loadMoreMatchesBtn.setAttribute('disabled', '');

                loadMoreMatchesBtn.innerHTML = `<img class="loading" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB2ElEQVR4nO2VPWtUQRSGR1ER/IDgF8RGRBMLLUX8+AkpLUxAQcTGQiwsAvkDNloIYqWCiEgqSVCwiZYiKbe/ubvnPe+ZvQv6A9SR2Sx6dze613vdK2IemGo+njNzzsw4t8kmG0DypKkkJERVT7u6IHHPiNBtikdjkYQQtg2LZYYqn6ny1Qyz+b5Os3lYVW6QrTOlpaZ4EgUG3BrqMzvaFpnqD4i74vHHk6DKFw9cKCWm4tP6kcq7QoFa89T3FEQ5MV9KbIY5Uyx7L+eKjA9hdbsp3vekH0Vk2tVFo9HYYSZnRWSf+y9JkmRn4cHtdut4zFcVYax6U2nEK0eVlzEFv5xA4tp6ccjTSmLF43yFe9XLIyLFbDdK4mEVcQy8/2rJ1ZGTVPVACGFrFTGAE0ZZ6z2rb38r11WJwZM8WJvwr+C1dYWUZ17l9shK/hnx0ffA+RDCFlcAA67nC8pU7heZN4SpLMQFBj/7NE0nSLmk2rrovd/9YzyW+sSU1JWB5BESN/N/svfNY1RobldJlqWTvUDvDIhflxJvBFWe9y/ebQ9iX5Zle0zxovudKlZi4O5PYZQPg2JS3rhxQ+Lu0I5VFsYu7nQ6e414lRMv1voqmdkhAPtrE7p/nW8ue+PYdWbC1wAAAABJRU5ErkJggg==" alt="spinner-frame-5">`

                await renderMatches(puuid, contentRight, loadMoreMatchesBtn, queueType);

                championStatsData = {};

                for (const match of contentRight.querySelectorAll('.match')) {
                    await processMatchData(match)
                }

                await renderChampionStats(championStats);
            });
        }

        // 저장된 소환사 전적 데이터가 없으면 render 및 db에 저장
        if (summonerStatsData === null) {
            await renderMatches(puuid, contentRight, loadMoreMatchesBtn, queueType);

            // 최근 플레이한 챔피언 데이터 처리
            for (const match of contentRight.querySelectorAll('.match')) {
                await processMatchData(match);
            }

            // 최근 플레이한 챔피언 render
            await renderChampionStats(championStats);

            await axios.post('/summonerStats', {
                summonerId: summoner.data.id,
                queueType: queueType,
                htmlContent: encodeURIComponent(statsContainer.outerHTML)
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            // 각 매치의 matchDetailBtn click event
            for (const match of contentRight.querySelectorAll('.match')) {
                const matchDetailBtn = match.querySelector('.match-detail-btn');
                const matchDetail = match.querySelector('.match-detail');

                matchDetailBtn.addEventListener('click', function () {
                    matchDetail.classList.toggle('opened');
                })
            }
        }

        sessionStorage.setItem('lastSummonerName', summonerName);
        main.removeChild(loadingContainer);

        if (lastSummonerName !== summonerName) {
            main.appendChild(summonerProfileContainer);
        }

        main.appendChild(statsContainer);

    } catch (err) {
        console.log(err);
        const errorMessage = err.response.data.message;
        const status = err.response.data.status;

        const error = new DOMParser().parseFromString(`
        <div class="error">
            <h1 class="status-code">${status}</h1>
            <p class="error-message">${errorMessage}</p>
            <button class="home-btn">Home</button>
        </div>`, 'text/html').querySelector('.error');

        // homeBtn click event
        const homeBtn = error.querySelector('.home-btn');
        homeBtn.addEventListener('click', () => location.href = '/');

        main.replaceChildren();
        main.appendChild(error);
    }
})();

// 매치정보를 UI에 표시하는 함수
async function renderMatches(puuid, contentRight, loadMoreMatchesBtn, queueType) {
    const renewTime = new Date(Number(localStorage.getItem(`renewTime_${summonerName}`))); // 갱신 시간
    renewTime.setMonth(renewTime.getMonth() - 3); // 3개월 전 날짜
    const startTime = Math.floor(renewTime.getTime() / 1000); // 3개월 이전까지의 전적을 가져오기 위한 3개월 전의 Epoch Timestamp(초 단위)

    const queue = {
        'ALL': 0,
        'SOLORANK': 420,
        'FLEXRANK': 440,
        'NORMAL': 490,
        'ARAM': 450
    };

    try {
        const response = await axios.get(`/lol/matchList?puuid=${puuid}&start=${start}&startTime=${startTime}&queue=${queue[queueType]}`);
        const matchList = response.data;

        // 전적이 존재하지 않을 때
        if (matchList.length === 0 && contentRight.querySelectorAll('.match')) {
            contentRight.innerHTML = `
                <div class="no-match">전적이 존재하지 않습니다.</div>
            `;

            return;
        }

        // 여러 매치 정보를 한 번에 보여주기 위한 fragment
        const matchesFragment = document.createDocumentFragment();

        for (const matchId of matchList) {
            try {
                const response = await axios.get('/lol/match?matchId=' + matchId);

                if (response && response.data) {
                    const info = response.data.info;

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
                     * 490 : 일반 게임(소환사의 협곡)
                     * 420 : 랭크 게임(솔로/듀오)
                     * 440 : 랭크 게임(자유랭크)
                     * 450 : 무작위 총력전(칼바람 나락)
                     * 900 : URF
                     * 1010 : 모두 무작위 URF
                     * 830 : AI 상대 게임(초급 봇)
                     * 840 : AI 상대 게임(중급 봇)
                     * 850 : AI 상대 게임(숙련 봇)
                     */
                    const queueId = info.queueId;

                    // queueId에 따른 queueType
                    const queueTypes = {
                        490: '일반',
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

                    // 참가자들 중, 챔피언에게 준 피해 max
                    let maxDamage = 0;
                    for (const participant of participants) {
                        maxDamage = Math.max(maxDamage, participant.totalDamageDealtToChampions);
                    }

                    // 참가자들 중, 받은 피해 max
                    let maxTakenDamage = 0;
                    for (const participant of participants) {
                        maxTakenDamage = Math.max(maxTakenDamage, participant.totalDamageTaken);
                    }

                    // 내 정보
                    const myInfo = participants.find(participant => puuid === participant.puuid);

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

                    // 내 아이템
                    const myItem0 = myInfo.item0;
                    const myItem1 = myInfo.item1;
                    const myItem2 = myInfo.item2;
                    const myItem3 = myInfo.item3;
                    const myItem4 = myInfo.item4;
                    const myItem5 = myInfo.item5;
                    const myItem6 = myInfo.item6;

                    // 내 스펠 이미지
                    const spell1Img = await getSpellImgs(myInfo.summoner1Id);
                    const spell2Img = await getSpellImgs(myInfo.summoner2Id);

                    // 소환사 룬 정보
                    const perks = myInfo.perks;
                    const perksStyles = perks.styles;
                    const primaryPerkStyleId = perksStyles[0].style; // 주 룬의 스타일 id
                    const primaryPerkId = perksStyles[0].selections[0].perk; // 주 룬 id
                    const subPerkStyleId = perksStyles[1].style === 0 ? 8100 : perksStyles[1].style; // 서브 룬의 스타일 id

                    // 룬 이미지 Url
                    const primaryRuneUrl = await getPrimaryRuneUrl(primaryPerkStyleId, primaryPerkId);
                    const subRuneUrl = await getSubRuneUrl(subPerkStyleId);

                    // kda avg
                    let myKdaAvg = ((myInfo.kills + myInfo.assists) / myInfo.deaths).toFixed(2);
                    if (!isFinite(myKdaAvg)) {
                        myKdaAvg = 'Perfect';
                    } else if (isNaN(myKdaAvg)) {
                        myKdaAvg = 0;
                    }

                    // HTML 생성
                    const match = new DOMParser().parseFromString(
                        `
                            <div class="match ${gameDuration <= 180 ? "again" : isWin ? "win" : "lose"}">
                                <div class="match-summary">
                                    <div class="infos">
                                        <div class="game-info">
                                            <div>
                                                <p class="queue-type">${queueType}</p>
                                                <p class="time-stamp">${timeStamp}</p>
                                            </div>
                                            <div class="line"></div>
                                            <div>
                                                <p class="result">${gameDuration <= 180 ? "다시하기" : isWin ? '승리' : '패배'}</p>
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
                                                    ${myInfo.kills}&thinsp;/&thinsp;${myInfo.deaths}&thinsp;/&thinsp;${myInfo.assists}</p>
                                            </div>
                                            <div>
                                                <p class="label">KA / D</p>
                                                <p class="kda-avg value">${myKdaAvg}</p>
                                            </div>
                                            <div>
                                                <p class="label">CS</p>
                                                <p class="cs value">${myInfo.totalMinionsKilled}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="match-detail-btn">
                                        <img src="${gameDuration <= 180 ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAfElEQVR4nO2QTQrCYAxE83mATCa9TkHo9boWKXgTeyvtXqbQ0oU/X93qg2zCvAnE7I84BHiNiKNVomw4R7kmgDzDea8pUUZZOdt9AfIE5wQ03SuZZAvnLZyX9XptySf5bUmt/LRkr7xQAjnMz9JzkYN2tpMSnr3mG9l+iAfDSx+fyNJJ1AAAAABJRU5ErkJggg==" : isWin ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAgUlEQVR4nGNgGAUM9fX/mTwb7+/2aLxnT2xwgNR6NdzfA9LLAAJeDQ+mezXc/0KMIVDNX0B6EKL//zN6NjyY6tl4/6tn/QMnnJrrH9p4Nd7/7Nl4fw7cdmINwa+ZgCHEacZhCGmaUQy5PxMSWPe/gNggMQaSwH+wId0gTLpmhhEFAAbtdmICvXslAAAAAElFTkSuQmCC" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAf0lEQVR4nO2QQQqDUAxEp72UM1AoeD3XRQRvUg+SeA11/UsUxI3t/+s6kE3Ie4EBriABd5PeI/nMrSNunRyCRcSk1qU5R7LC0hzMvkzAzcmXSYtJ9RlsVfVwcnKp37/nSr7CvyRZ8JmkCD5KjOyirLUwsosdSpI2SRNTDOO/8gHlO1mTtYIXXgAAAABJRU5ErkJggg=="}" alt="expand-arrow--v1">
                                    </button>
                                </div>
                                <div class="match-detail">
                                    <table class="${gameDuration <= 180 ? "again" : isWin ? "win" : "lose"}">
                                        <colgroup>
                                            <col width="90">
                                            <col width="90">
                                            <col width="50">
                                            <col width="120">
                                            <col width="58">
                                            <col width="56">
                                            <col width="155">
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th colspan="2"><span class="result">${gameDuration <= 180 ? "" : isWin ? "승리" : "패배"}</span> ${myTeamId === 100 ? "(블루팀)" : "(레드팀)"}</th>
                                                <th>KDA</th>
                                                <th>피해량</th>
                                                <th>와드</th>
                                                <th>CS</th>
                                                <th>아이템</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                    ${gameDuration <= 180 ? '' : `<div class="summary">
                                        <div class="objectives ${gameDuration <= 180 ? "again" : isWin ? "win" : "lose"}">
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
                                                <div style="width: ${Math.round((myTeamTotalKills * 100 / (myTeamTotalKills + enemyTeamTotalKills)) * 100) / 100}%; height: 100%; background-color: #E84057"></div>
                                                <div style="width: ${100 - Math.round((myTeamTotalKills * 100 / (myTeamTotalKills + enemyTeamTotalKills)) * 100) / 100}%; height: 100%; background-color: #5383E8"></div>
                                            </div>
                                            <div class="total total-gold">
                                                <div class="value">
                                                    <p>${myTeamTotalGold}</p>
                                                    <p>Total Gold</p>
                                                    <p>${enemyTeamTotalGold}</p>
                                                </div>
                                                <div style="width: ${Math.round((myTeamTotalGold * 100 / (myTeamTotalGold + enemyTeamTotalGold)) * 100) / 100}%; height: 100%; background-color: #E84057"></div>
                                                <div style="width: ${100 - Math.round((myTeamTotalGold * 100 / (myTeamTotalGold + enemyTeamTotalGold)) * 100) / 100}%; height: 100%; background-color: #5383E8"></div>
                                            </div>
                                        </div>
                                        <div class="objectives ${gameDuration <= 180 ? "again" : !isWin ? "win" : "lose"}">
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
                                    </div>`}
                                    
                                    <table class="${gameDuration <= 180 ? "again" : !isWin ? "win" : "lose"}">
                                        <colgroup>
                                            <col width="90">
                                            <col width="90">
                                            <col width="50">
                                            <col width="120">
                                            <col width="58">
                                            <col width="56">
                                            <col width="155">
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th colspan="2"><span class="result">${gameDuration <= 180 ? "" : !isWin ? "승리" : "패배"}</span> ${myTeamId !== 100 ? "(블루팀)" : "(레드팀)"}</th>
                                                <th>KDA</th>
                                                <th>피해량</th>
                                                <th>와드</th>
                                                <th>CS</th>
                                                <th>아이템</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        `, 'text/html');

                    const matchDetailBtn = match.querySelector('.match-detail-btn');
                    const matchDetail = match.querySelector('.match-detail');

                    // matchDetailBtn click event
                    matchDetailBtn.addEventListener('click', function () {
                        matchDetail.classList.toggle('opened');
                    })

                    const tables = match.querySelectorAll('.match-detail > table');

                    const tbodies = [
                        {tbody: tables[0].querySelector('tbody'), participants: myTeamParticipants},
                        {tbody: tables[1].querySelector('tbody'), participants: enemyTeamParticipants},
                    ];

                    // 상세 정보 테이블의 tbody에 참가자 정보 넣기
                    for (const {tbody, participants} of tbodies) {
                        for (const participant of participants) {
                            if (participant.championName === 'FiddleSticks') participant.championName = 'Fiddlesticks';

                            const spell1Img = await getSpellImgs(participant.summoner1Id);
                            const spell2Img = await getSpellImgs(participant.summoner2Id);

                            const perks = participant.perks;
                            const perksStyles = perks.styles;
                            const primaryPerkStyleId = perksStyles[0].style; // 주 룬의 스타일 id
                            const primaryPerkId = perksStyles[0].selections[0].perk; // 주 룬 id
                            const subPerkStyleId = perksStyles[1].style === 0 ? 8100 : perksStyles[1].style; // 서브 룬의 스타일 id

                            const primaryRuneUrl = await getPrimaryRuneUrl(primaryPerkStyleId, primaryPerkId);
                            const subRuneUrl = await getSubRuneUrl(subPerkStyleId);

                            // kdaAvg
                            let kdaAvg = ((participant.kills + participant.assists) / participant.deaths).toFixed(2);

                            if (!isFinite(kdaAvg)) {
                                kdaAvg = 'Perfect';
                            } else if (isNaN(kdaAvg)) {
                                kdaAvg = 0;
                            }

                            const html = `
                                <tr class="${participant.championName === myInfo.championName ? "me" : ""}">
                                <td>
                                    <div class="build">
                                        <div class="champion">
                                            <p>${participant.champLevel}</p>
                                            <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${participant.championName}.png"
                                                 alt="">
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
                                </td>
                                <td>
                                    <div>
                                        <p title="${participant.riotIdGameName}#${participant.riotIdTagline}" class="summoner-name">${participant.riotIdGameName}</p>
                                        <p>Platinum 4</p>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <p>${participant.kills}/${participant.deaths}/${participant.assists}</p>
                                        <p>${kdaAvg}${kdaAvg === 'Perfect' ? "" : ":1"}</p>
                                    </div>
                                </td>
                                <td>
                                    <div class="damage">
                                        <div class="damage-info">
                                            <p>${participant.totalDamageDealtToChampions}</p>
                                            <div class="graph">
                                                <div class="bar" style="width: ${Math.round((participant.totalDamageDealtToChampions / maxDamage) * 100)}%; height: 100%; background-color: #F24B4B"></div>
                                            </div>
                                        </div>
                                        <div class="damage-info">
                                            <p>${participant.totalDamageTaken}</p>
                                            <div class="graph">
                                                <div class="bar" style="width: ${Math.round((participant.totalDamageTaken / maxTakenDamage) * 100)}%; height: 100%; background-color: #9E9EB1"></div>
                                            </div>
                                        </div> 
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <p>${participant.visionWardsBoughtInGame}</p>
                                        <p>${participant.wardsKilled} / ${participant.wardsPlaced}</p>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <p>${participant.neutralMinionsKilled + participant.totalMinionsKilled}</p>
                                    </div>
                                </td>
                                <td>
                                    <div class="items">
                                        <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.item0}.png" alt="">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.item1}.png" alt="">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.item2}.png" alt="">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.item3}.png" alt="">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.item4}.png" alt="">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.item5}.png" alt="">
                                                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.item6}.png" alt="">
                                    </div>
                                </td>
                            </tr>
                            `;

                            // <tr>이 최상위 태그면 querySelector로 tr 태그를 가져오지 못해서 table로 감싼 뒤 가져옴.
                            const wrappedHtml = `<table>${html}</table>`;

                            const participantElement = new DOMParser().parseFromString(wrappedHtml, 'text/html');

                            const trElement = participantElement.querySelector('tr');

                            tbody.appendChild(trElement);
                        }
                    }

                    matchesFragment.appendChild(match.querySelector('.match'));

                }
            } catch (err) {
                console.log(err.response.data);
            }
        }

        contentRight.insertBefore(matchesFragment, loadMoreMatchesBtn);

        if (matchList.length < 20) {
            loadMoreMatchesBtn.remove();
        } else {
            loadMoreMatchesBtn.replaceChildren();
            loadMoreMatchesBtn.removeAttribute('disabled');
            loadMoreMatchesBtn.innerText = 'Load More';
        }

        start += 20;
    } catch (err) {
        console.log('Error fetching matchList:', err);
        throw err; // 에러를 호출자에게 전달
    }
}

// spell image를 가져오는 함수
async function getSpellImgs(spellId) {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/summoner.json`);

        const spells = await response.json();

        // 배열로 변환 후, find로 특정 스펠 img 찾은 후 return
        return Object.values(spells.data).find(spell => parseInt(spell.key) === spellId).image.full;
    } catch (err) {
        console.log(err);
    }
}

// 주 룬 url을 가져오는 함수
async function getPrimaryRuneUrl(primaryRuneStyleId, primaryRuneId) {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/runesReforged.json`);

        const runes = await response.json();

        const primaryRuneInfos = runes.find(rune => rune.id === primaryRuneStyleId); // 주 룬 정보 전체 가져오기
        const primaryRuneInfo = primaryRuneInfos.slots[0].runes.find(rune => rune.id === primaryRuneId); // 유저의 주 룬 id와 같은 룬 정보 가져오기

        return 'https://ddragon.leagueoflegends.com/cdn/img/' + primaryRuneInfo.icon; // 주 룬 이미지 경로 return
    } catch (err) {
        console.log(err);
    }
}

// 서브 룬 url을 가져오는 함수
async function getSubRuneUrl(subRuneStyleId) {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/runesReforged.json`);
    if (!response.ok) {
        throw new Error('Failed to fetch JSON data');
    }

    const runes = await response.json();

    // 서브 룬 이미지 주소 가져오기
    const subRuneInfo = runes.find(rune => rune.id === subRuneStyleId);

    return 'https://ddragon.leagueoflegends.com/cdn/img/' + subRuneInfo.icon; // 서브 룬 이미지 경로 return
}

// 검색한 소환사 이름을 최근 검색 로컬 스토리지에 저장 & 최근 검색어 목록에 추가하는 함수
async function saveRecentSearch(summonerName) {
    const max = 10;
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    recentSearches = recentSearches.filter(search => search !== summonerName);
    recentSearches.unshift(summonerName); // 검색한 소환사 이름 맨 앞에 추가

    if (recentSearches.length > max) {
        recentSearches.pop();
    }

    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

    // 최근 검색어를 담고 있는 ul에 추가
    const ul = document.getElementById('recentSearchContainer').querySelector('ul'); // ul

    // 최근 검색어 목록에서 이미 존재하는 소환사 이름의 li를 제거하기 위해, 모든 li 요소를 순회하며 현재 검색한 소환사 이름인 li 찾기
    ul.querySelectorAll("li").forEach(li => {
        if (li.textContent.trim() === summonerName) {
            li.remove(); // 해당 li 요소 제거
        }
    });

    const [gameName, tagLine] = summonerName.split('#');

    const li = new DOMParser().parseFromString(`
        <li>
            <a href="/summoners?summonerName=${encodeURIComponent(summonerName)}">${gameName}<span class="tag-line">#${tagLine}</span></a>
            <button type="button" class="delete-recent-search-btn">
                <img class="x" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA5ElEQVR4nO2UTU4CQRCF5wZMOAEcUdh5LILar97r1BZJ9CoaWSBuIAOZYIZhbGjckHlJb7oq+fLqryh69aol2WMUPiUEdy+LDrl7KRqi7DsSD0WqRHxE2fbwsDwHcveyite5ItbJkEibHSHtIG8A9o9myRCSA9EWDdB7CGFYxyPttQF4q+PZIADjmwC6SiLi569SXqx2R5bv4NTRyyjKNg3Ipvq/CaC1yTodhgwH/9wTnhlTAOOu8c4GhF97kg2KtOdrNl7EUzJExOq622Vf6RDZtDqSEuZJV1iYV/kkJsmQXvevHUgt1YwHOHhtAAAAAElFTkSuQmCC" alt="multiply">
            </button>
        </li>
    `, 'text/html').querySelector('li');

    ul.prepend(li); // ul의 첫 번째 자식으로 추가
}

// match 데이터를 처리하는 함수
async function processMatchData(match) {
    const kdaText = match.querySelector(".kda.value").innerText.trim();
    const [kills, deaths, assists] = kdaText.split(" / ").map(Number);
    const championImg = match.querySelector('.champion img').src;
    let championName = championImg.split('/').pop().split('.')[0];

    if (championName === 'FiddleSticks') championName = 'Fiddlesticks';

    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`);

        const champions = await response.json();
        const championInfo = champions.data[championName];
        const championNameKR = championInfo.name;

        if (!championStatsData[championName]) {
            championStatsData[championName] = {
                championNameKR: championNameKR,
                games: 0,
                wins: 0,
                losses: 0,
                kills: 0,
                deaths: 0,
                assists: 0
            };
        }

        championStatsData[championName].games++;
        championStatsData[championName].wins += match.classList.contains('win') ? 1 : 0;
        championStatsData[championName].losses += !match.classList.contains('win') ? 1 : 0;
        championStatsData[championName].kills += kills;
        championStatsData[championName].deaths += deaths;
        championStatsData[championName].assists += assists;
    } catch (error) {
        console.log(error);
    }
}

async function renderChampionStats(championStats) {
    const sortedChampionStatsData = Object.entries(championStatsData).sort((a, b) => b[1].games - a[1].games);

    championStats.innerHTML = '<div class="header">최근 플레이한 챔피언</div>';

    sortedChampionStatsData.forEach(([championName, stats]) => {
        const content = document.createElement('div');
        content.classList.add('content');
        const {championNameKR, games, wins, losses, kills, deaths, assists} = stats;

        content.innerHTML = `
            <div class="champion-info">
                <img src="https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png" alt="">
                <p>${championNameKR}</p>
            </div>
            <div class="kda-info">
                <div>${kills} / ${deaths} / ${assists}</div>
                <p>${((kills + assists) / deaths).toFixed(2)}:1</p>
            </div>
            <div class="win-lose-info">
                <p >${(wins * 100 / (wins + losses)).toFixed(0)}%</p>
                <p>${games} 경기</p>
            </div>
        `;

        championStats.appendChild(content);
    });
}