package com.example.lolsearch.controller;

import com.example.lolsearch.exception.CustomException;
import com.example.lolsearch.service.LolService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.concurrent.TimeoutException;

@RestController
@RequestMapping("/lol")
@Slf4j
public class LolController {
    private final LolService lolService;

    public LolController(LolService lolService) {
        this.lolService = lolService;
    }

    @GetMapping("/match")
    public Mono<ResponseEntity<String>> getMatch(@RequestParam("matchId") String matchId) {
        return lolService.getMatch(matchId)
                .map(response -> ResponseEntity.ok(response)) // Mono 객체의 값을 변환하는 함수. 성공 시 200 OK 반환
                // 예외가 발생하거나 비동기 작업이 실패하면 실행하는 함수
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error: " + e.getMessage()))); // 오류 발생 시 500 상태 반환
    }

    @GetMapping("/matchList")
    public Mono<ResponseEntity<String>> getMatchList(@RequestParam("puuid") String puuid,
                                                     @RequestParam("start") int start,
                                                     @RequestParam("startTime") long startTime) {
        return lolService.getMatchList(puuid, start, startTime)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error: " + e.getMessage())));
    }

    @GetMapping("/puuid")
    public Mono<ResponseEntity<String>> getPuuid(@RequestParam("summonerName") String summonerName) {
        return lolService.getPuuid(summonerName)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(CustomException.class, e -> {
                    // CustomException 처리
                    return Mono.just(ResponseEntity.status(e.getStatus()).body(e.getMessage()));
                });
    }




    @GetMapping("/account")
    public Mono<ResponseEntity<String>> getAccount(@RequestParam("puuid") String puuid) {
        return lolService.getAccount(puuid)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(e -> {
                    // 예외 타입에 따른 처리
                    if (e instanceof TimeoutException) {
                        // 타임아웃 오류 처리
                        return Mono.just(ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT)
                                .body("Request timeout"));
                    } else if (e instanceof WebClientResponseException) {
                        // 다른 WebClient 오류 처리
                        return Mono.just(ResponseEntity.status(((WebClientResponseException) e).getStatusCode())
                                .body("Error: " + e.getMessage()));
                    } else {
                        // 기타 예외 처리 (예: 500 Internal Server Error)
                        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error: " + e.getMessage()));
                    }
                });
    }

    @GetMapping("/summoner")
    public Mono<ResponseEntity<String>> getSummoner(@RequestParam("puuid") String puuid) {
        return lolService.getSummoner(puuid)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error: " + e.getMessage())));
    }
}
