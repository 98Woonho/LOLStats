package com.example.valsearch.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final String RIOT_API_KEY = "RGAPI-0d1fb0b9-1489-430a-9d2e-d714c436c321";

    private final WebClient webClient;

    public ApiController() {
        this.webClient = WebClient.builder()
                .baseUrl("https://asia.api.riotgames.com")
                .defaultHeader("X-Riot-Token", RIOT_API_KEY)
                .build();
    }

    @GetMapping("/getPUUID")
    public ResponseEntity<?> getPUUID(@RequestParam String gameName, @RequestParam String tagLine) {
        try {
            // Riot API 호출
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}")
                            .build(gameName, tagLine))
                    .retrieve()
                    .bodyToMono(String.class) // 응답을 문자열로 받기
                    .block(); // 동기 방식으로 처리

            return ResponseEntity.ok(response);
        } catch (WebClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            // 기타 서버 내부 에러 처리
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }
}
