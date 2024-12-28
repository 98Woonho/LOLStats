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

    // 플레이어 이름을 직접 검색했을 때 나오는 경로. API를 호출해서 총 데이터를 가져온 뒤 localStorage에 저장하는 방식으로 구현 예정
    // url로 플레이어 이름과 카테고리를 입력해서 바로 들어오는 경우에는 localStorage에 해당 플레이어의 데이터가 있는지 없는지 확인 후, 없으면 API 호출, 있으면 데이터로 전적 표시
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
