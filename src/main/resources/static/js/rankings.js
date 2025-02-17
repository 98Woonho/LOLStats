const selectTierBtn = document.getElementById('selectTierBtn');
const tierFilter = document.getElementById('tierFilter');

const tierList = new DOMParser().parseFromString(`
    <ul class="tier-list">
        <li>All</li>
        <li>
            <img src="/images/rank-emblems/Challenger.png" alt="">
            Challenger
        </li>
        <li>
            <img src="/images/rank-emblems/Grandmaster.png" alt="">
            Grandmaster
        </li>
        <li>
            <img src="/images/rank-emblems/Master.png" alt="">
            Master
        </li>
        <li>
            <img src="/images/rank-emblems/Diamond.png" alt="">
            Diamond
        </li>
        <li>
            <img src="/images/rank-emblems/Emerald.png" alt="">
            Emerald
        </li>
        <li>
            <img src="/images/rank-emblems/Platinum.png" alt="">
            Platinum
        </li>
        <li>
            <img src="/images/rank-emblems/Gold.png" alt="">
            Gold
        </li>
        <li>
            <img src="/images/rank-emblems/Silver.png" alt="">
            Silver
        </li>
        <li>
            <img src="/images/rank-emblems/Bronze.png" alt="">
            Bronze
        </li>
        <li>
            <img src="/images/rank-emblems/Iron.png" alt="">
            Iron
        </li>
    </ul>
`, 'text/html').querySelector('.tier-list')

document.addEventListener('click', function (event) {
    if (event.target === selectTierBtn && !tierFilter.contains(tierList)) {
        // 티어 선택 버튼 클릭 && tierList가 tierFilter에 포함되어있지 않은 경우
        tierFilter.appendChild(tierList);
        selectTierBtn.querySelector('img').src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAeElEQVR4nJ3PMQrCQBCF4S3VWxjRk6TVu+zO/2C7iWdK4WksPIXpIpEIa2AjOPB3HzwmhH/P3TdTP6GkDvBVlHNugKekQdKxCoFe0jh3q01eCvTOzM5fKMa4Be5LCDzcfVdOXpeoqPugw/xADQ4ppVMwsz3QrjWZF8abbLchgNj5AAAAAElFTkSuQmCC';
    } else if (tierFilter.contains(tierList)) {
        // 모든 요소를 클릭 했을 때, tierList가 tierFilter에 포함되어있는 경우
        tierFilter.removeChild(tierList);
        selectTierBtn.querySelector('img').src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAe0lEQVR4nGNgIBaUlZVplpaWhuLDZWVlmgxFRUWypaWlX0pLS//jwN/Ky8sVwKaWlpbW4FJYUlJSDbe+vr6eraSk5AYWRbfr6+s50N3qisVEL6weKykpWYukaA3OEIB5rKSk5CvcA7hAaWlpVVlZWSXBcM3NzWUHYXQJAMMabOBg+HwjAAAAAElFTkSuQmCC';
    }
})

const ranking = document.getElementById('ranking');
const trs = ranking.querySelectorAll('tbody tr');

trs.forEach(tr => {
    const span = tr.querySelector('span');

    if (span) {
        span.addEventListener('click', function() {
            window.location.href = `/summoners/${encodeURIComponent(span.innerText)}/ALL`;
        })
    }
})