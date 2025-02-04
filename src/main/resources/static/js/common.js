const summonerNameInput = document.getElementById('summonerName');
const recentSearchContainer = document.getElementById('recentSearchContainer');

// 소환사 이름 검색 input 클릭 시, 최근 검색 창 보이기
summonerNameInput.addEventListener('click', () => recentSearchContainer.hidden = false);

// 그 외 요소 클릭 시, 최근 검색 창 숨기기
document.addEventListener('click', (event) => {
    if (!summonerNameInput.contains(event.target) && !recentSearchContainer.contains(event.target) && !event.target.classList.contains('x')) {
        recentSearchContainer.hidden = true;
    }
});

// 최근 검색 컨테이너에 최근 검색어 추가
const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || []; // 로컬 스토리지에 recentSearches가 있으면 가져오고, 없으면 빈 배열
const ul = recentSearchContainer.querySelector('ul'); // 최근 검색어를 담을 ul

for (const recentSearch of recentSearches) {
    const [gameName, tagLine] =  recentSearch.split('#');

    const li = new DOMParser().parseFromString(`
        <li>
            <a href="/summoners?summonerName=${encodeURIComponent(recentSearch)}">${gameName}<span class="tag-line">#${tagLine}</span></a>
            <button type="button" class="delete-recent-search-btn">
                <img class="x" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA5ElEQVR4nO2UTU4CQRCF5wZMOAEcUdh5LILar97r1BZJ9CoaWSBuIAOZYIZhbGjckHlJb7oq+fLqryh69aol2WMUPiUEdy+LDrl7KRqi7DsSD0WqRHxE2fbwsDwHcveyite5ItbJkEibHSHtIG8A9o9myRCSA9EWDdB7CGFYxyPttQF4q+PZIADjmwC6SiLi569SXqx2R5bv4NTRyyjKNg3Ipvq/CaC1yTodhgwH/9wTnhlTAOOu8c4GhF97kg2KtOdrNl7EUzJExOq622Vf6RDZtDqSEuZJV1iYV/kkJsmQXvevHUgt1YwHOHhtAAAAAElFTkSuQmCC" alt="multiply">
            </button>
        </li>
    `, 'text/html').querySelector('li');

    const deleteRecentSearchBtn = li.querySelector('.delete-recent-search-btn');

    // 최근 검색어 삭제 버튼 클릭 event
    deleteRecentSearchBtn.addEventListener('click', () => {
        ul.removeChild(li);

        // 로컬 스토리지의 recentSearches에 소환사 이름 제거
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || []);
        recentSearches = recentSearches.filter(search => search !== recentSearch);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    });

    ul.appendChild(li);
}

recentSearchContainer.appendChild(ul);