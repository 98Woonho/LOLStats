package com.example.lolstats.domain.repository;

import com.example.lolstats.domain.dto.SummonerStatsDto;
import com.example.lolstats.domain.entity.Summoner;
import com.example.lolstats.domain.entity.SummonerStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SummonerStatsRepository extends JpaRepository<SummonerStats, String> {
    SummonerStats findBySummonerIdAndQueueType(String summonerId, String queueType);
}
