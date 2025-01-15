package com.example.lolsearch.controller;


import com.example.lolsearch.service.SummonerService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

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
                .baseUrl("https://kr.api.riotgames.com")
                .defaultHeader("X-Riot-Token", RIOT_API_KEY)
                .build();
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/summoners/{summonerName}")
    public String getSummoners(@PathVariable(value = "summonerName") String summonerName, Model model) {
        model.addAttribute("summonerName", summonerName);
        return "summoners";
    }

    // TODO : 현재 랭크 순위에 있는 모든 유저들 DB에 저장해야 함.
    @ResponseBody
    @GetMapping("/test")
    public ResponseEntity<?> testSummoners() {
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

        String response = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/lol/league/v4/entries/{queue}/{tier}/{division}")
                        .queryParam("page", 500)
                        .build(queue, "DIAMOND", "I"))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return ResponseEntity.ok(response);

//        Summoner summoner = Summoner.builder()
//                .puuid("test")
//                .gameName("그래그래 좋았다")
//                .tagName("KR1")
//                .build();
//        boolean result = summonerService.addSummoner(summoner);
    }
}
