package com.example.lolstats.service;

import com.example.lolstats.domain.dto.RanksDto;
import com.example.lolstats.domain.dto.SummonerDto;
import reactor.core.publisher.Mono;

public interface LolService {
    Mono<String> getMatch(String matchId);
    Mono<String> getMatchList(String puuid, int start, long startTime, int queue);
    Mono<String> getAccount(String puuid);
    SummonerDto getSummoner(String summonerName);
    RanksDto getRanks(String summonerId);
}
