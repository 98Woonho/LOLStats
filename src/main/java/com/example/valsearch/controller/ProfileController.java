package com.example.valsearch.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.reactive.function.client.WebClient;

@Controller
@RequestMapping("profile")
@Slf4j
public class ProfileController {
    @Value("${riot.api.key}")
    private String RIOT_API_KEY;

    private final WebClient webClient;

    public ProfileController() {
        this.webClient = WebClient.builder()
                .baseUrl("https://asia.api.riotgames.com")
                .defaultHeader("X-Riot-Token", RIOT_API_KEY)
                .build();
    }

    @GetMapping("overview")
    public void getOverview(@RequestParam(value="playerName") String playerName) {
        log.info(playerName);
        String[] playerNames = playerName.split("#");
        String gameName = playerNames[0];
        String tagLine = playerNames[1];

        String response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}")
                        .build(gameName, tagLine))
                .retrieve()
                .bodyToMono(String.class) // 응답을 문자열로 받기
                .block(); // 동기 방식으로 처리

        log.info(response);
    }
}
