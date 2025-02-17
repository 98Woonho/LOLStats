package com.example.lolstats.service;

import com.example.lolstats.domain.dto.SummonerStatsDto;
import com.example.lolstats.domain.entity.SummonerStats;

public interface SummonerStatsService {
    SummonerStats addSummonerStats(SummonerStatsDto summonerStatsDto);
    SummonerStats getSummonerStats(String summonerId, String queueType);
}
