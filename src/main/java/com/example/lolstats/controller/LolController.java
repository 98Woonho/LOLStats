package com.example.lolstats.controller;

import com.example.lolstats.domain.dto.RanksDto;
import com.example.lolstats.domain.dto.SummonerDto;
import com.example.lolstats.exception.CustomException;
import com.example.lolstats.service.LolService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

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
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(CustomException.class, e -> Mono.just(ResponseEntity.status(e.getStatus()).body(e.getMessage())));
    }

    @GetMapping("/matchList")
    public Mono<ResponseEntity<String>> getMatchList(@RequestParam("puuid") String puuid,
                                                     @RequestParam("start") int start,
                                                     @RequestParam("startTime") long startTime,
                                                     @RequestParam("queue") int queue) {
        return lolService.getMatchList(puuid, start, startTime, queue)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(CustomException.class, e -> Mono.just(ResponseEntity.status(e.getStatus()).body(e.getMessage())));
    }

    @GetMapping("/account")
    public Mono<ResponseEntity<String>> getAccount(@RequestParam("puuid") String puuid) {
        return lolService.getAccount(puuid)
                .map(response -> ResponseEntity.ok(response))
                .onErrorResume(CustomException.class, e -> Mono.just(ResponseEntity.status(e.getStatus()).body(e.getMessage())));
    }

    @GetMapping("/summoner")
    public SummonerDto getSummoner(@RequestParam("summonerName") String summonerName) {
        return lolService.getSummoner(summonerName);
    }

    @GetMapping("/ranks")
    public RanksDto getRanks(@RequestParam("summonerId") String summonerId) {
        return lolService.getRanks(summonerId);
    }
}
