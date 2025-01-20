package com.example.lolsearch.service;

import reactor.core.publisher.Mono;

public interface LolService {
    Mono<String> getMatch(String matchId);
    Mono<String> getMatchList(String puuid, int start, long startTime);
    Mono<String> getPuuid(String summonerName);
    Mono<String> getAccount(String puuid);
    Mono<String> getSummoner(String puuid);
}
