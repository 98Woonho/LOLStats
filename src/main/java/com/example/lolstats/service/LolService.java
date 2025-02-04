package com.example.lolstats.service;

import reactor.core.publisher.Mono;

public interface LolService {
    Mono<String> getMatch(String matchId);
    Mono<String> getMatchList(String puuid, int start, long startTime, int queue);
    Mono<String> getPuuid(String summonerName);
    Mono<String> getAccount(String puuid);
    Mono<String> getSummoner(String puuid);
}
