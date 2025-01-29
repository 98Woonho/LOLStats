package com.example.lolstats.controller;


import com.example.lolstats.domain.dto.SummonerDto;
import com.example.lolstats.domain.dto.SummonerLeagueDto;
import com.example.lolstats.service.SummonerService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Controller
@Slf4j
public class HomeController {
    @Autowired
    private SummonerService summonerService;

    @Value("${riot.api.key}")
    private String RIOT_API_KEY;

    private WebClient webClient;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .defaultHeader("X-Riot-Token", RIOT_API_KEY)
                .build();
    }

    @GetMapping("/riot")
    public String riotTxt() {
        return "riot";
    }

    // home
    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/summoners")
    public String getSummoners(@RequestParam(value = "summonerName") String summonerName, Model model) {
        model.addAttribute("summonerName", summonerName);
        return "summoners";
    }

    // 티어별 유저 정보를 가져오는 controller test
    @GetMapping("/test")
    public void testSummoners() {
        String queue = "RANKED_SOLO_5x5";
        String[] tiers = {"IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"};
        String[] divisions = {"I", "II", "III", "IV"};

//        for (String tier : tiers) {
//            for (String division : divisions) {
//                String response = webClient.get()
//                        .uri(uriBuilder -> uriBuilder.path("https://asia.api.riotgames.com/lol/league/v4/entries/{queue}/{tier}/{division}")
//                                .queryParam("page", queue)
//                                .build(queue, tier, division))
//                        .retrieve()
//                        .bodyToMono(String.class)
//                        .block();
//            }
//        }

        List<SummonerLeagueDto> summonerLeagueDtos = webClient.get()
                .uri("https://kr.api.riotgames.com/lol/league/v4/entries/{queue}/{tier}/{division}?page=1", queue, "IRON", "I")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SummonerLeagueDto>>() {})
                .block();

        // tier(티어)
        // rank(랭크)
        // leaguePoints(LP)
        // wins(승리 횟수)
        // losses(패배 횟수)
        // puuid(유저 고유 id)
        // gameName(게임 이름)
        // tagName(태그 이름)
        for (SummonerLeagueDto league : summonerLeagueDtos) {
            SummonerDto summonerDto = webClient.get()
                    .uri("https://kr.api.riotgames.com/lol/summoner/v4/summoners/{summonerId}", league.getSummonerId())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<com.example.lolstats.domain.dto.SummonerDto>() {
                    })
                    .block();
        }

//        Summoner summoner = Summoner.builder()
//                .puuid("test")
//                .gameName("그래그래 좋았다")
//                .tagName("KR1")
//                .build();
//        boolean result = summonerService.addSummoner(summoner);
    }
}
