package com.example.lolsearch.controller;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

// API를 호출하는 Controller
@RestController
@RequestMapping("/api")
@Slf4j
public class ApiController {
    @Value("${riot.api.key}")
    private String RIOT_API_KEY;

    private WebClient webClient;

    // 생성자를 사용해서 webClient를 초기화 할려고 하니, 어노테이션으로 주입받는 RIOT_API_KEY가 주입이 완료되기 전에 생성자가 RIOT_API_KEY에 접근을 할려고 해서 GET 요청에서 401(권한 없음) 오류가 발생함.
    // 그래서 모든 Bean이 초기화 된 후에 해당 메서드를 실행시켜주는 @PostConstruct를 사용
    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl("https://asia.api.riotgames.com")
                .defaultHeader("X-Riot-Token", RIOT_API_KEY)
                .build();
    }



    // 플레이어 이름을 직접 검색했을 때 나오는 경로. API를 호출해서 총 데이터를 가져온 뒤 localStorage에 저장하는 방식으로 구현 예정
    // url로 플레이어 이름과 카테고리를 입력해서 바로 들어오는 경우에는 localStorage에 해당 플레이어의 데이터가 있는지 없는지 확인 후, 없으면 API 호출, 있으면 데이터로 전적 표시

    // 매치 정보를 가져오는 controller
    @GetMapping("/match")
    public ResponseEntity<?> getMatch(@RequestParam(value="matchId") String matchId) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/lol/match/v5/matches/{matchId}")
                            .build(matchId))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    // puuid로 매치리스트를 가져오는 controller
    @GetMapping("/matchList")
    public ResponseEntity<?> getMatchList(@RequestParam(value="puuid") String puuid) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                            // .queryParam("type", "ranked") // 쿼리 파라미터 추가
                            .queryParam("queue", "420")
                            .build(puuid))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    // playerName으로 puuid를 가져오는 controller
    @GetMapping("/puuId")
    public ResponseEntity<?> getPUUID(@RequestParam(value="summonerName") String summonerName) {
        try {
            String[] summonerNames = summonerName.split("#");
            String gameName = summonerNames[0];
            String tagLine = summonerNames[1];

            // Riot API 호출
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}")
                            .build(gameName, tagLine)) // 경로에 파라미터(gameName, tagLine) 삽입
                    .retrieve() // 요청을 보내고 응답을 받음
                    .bodyToMono(String.class) // 응답을 문자열로 받기
                    .block(); // 동기 방식으로 처리

            // 정상적으로 응답이 오면 ResponseEntity로 200 OK 상태와 함께 응답 본문 반환
            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            // WebClient에서 발생한 오류 처리
            // HTTP 오류가 발생한 경우 (예: 404 Not Found, 401 Unauthorized 등)
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            // 그 외의 예외 (예: 서버 내부 오류) 처리
            // 예외 발생 시 500 상태 코드와 함께 오류 메시지 반환
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @GetMapping("/account")
    public ResponseEntity<?> getAccount(@RequestParam(value="puuid") String puuid) {
        try {

            // Riot API 호출
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/riot/account/v1/accounts/by-puuid/{puuid}")
                            .build(puuid)) //
                    .retrieve() // 요청을 보내고 응답을 받음
                    .bodyToMono(String.class) // 응답을 문자열로 받기
                    .block(); // 동기 방식으로 처리

            // 정상적으로 응답이 오면 ResponseEntity로 200 OK 상태와 함께 응답 본문 반환
            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            // WebClient에서 발생한 오류 처리
            // HTTP 오류가 발생한 경우 (예: 404 Not Found, 401 Unauthorized 등)
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            // 그 외의 예외 (예: 서버 내부 오류) 처리
            // 예외 발생 시 500 상태 코드와 함께 오류 메시지 반환
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }
}
