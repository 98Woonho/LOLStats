// async function getPlayerPUUID(playerName) {
//     try {
//         const [gameName, tagLine] = playerName.split('#');
//
//         const response = await fetch(`http://localhost:8080/api/getPUUID?gameName=${gameName}&tagLine=${tagLine}`, {
//             method: 'GET',
//             headers: {
//                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
//                 "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
//                 "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
//                 "Origin": "https://developer.riotgames.com"
//             }
//         });
//
//         const data = await response.json();
//
//         if (!response.ok) {
//             // 에러 처리
//             alert(`API Error: ${data.status.status_code} - ${data.status.message}`);
//             return null;
//         }
//
//         // 성공 시 PUUID 반환
//         return data.puuid;
//     } catch (error) {
//         console.error('puuid 요청 실패 : ', error);
//         throw error;
//     }
// }
//
// window.onload = async function() {
//     const playerName = encodeURIComponent(document.getElementById('playerName').value);
//
//     const puuId = await getPlayerPUUID(playerName);
//
//     console.log(puuId);
// };