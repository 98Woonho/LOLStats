package com.example.lolstats.service;

import com.example.lolstats.domain.dto.SummonerStatsDto;
import com.example.lolstats.domain.entity.SummonerStats;
import com.example.lolstats.domain.repository.SummonerStatsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SummonerStatsServiceImpl implements SummonerStatsService {
    private final SummonerStatsRepository summonerStatsRepository;

    public SummonerStatsServiceImpl(SummonerStatsRepository summonerStatsRepository) {
        this.summonerStatsRepository = summonerStatsRepository;
    }

    public SummonerStats addSummonerStats(SummonerStatsDto summonerStatsDto) {
        SummonerStats summonerStats = new SummonerStats(summonerStatsDto);

        try {
            return summonerStatsRepository.save(summonerStats);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    public SummonerStats getSummonerStats(String summonerId, String queueType) {
        try {
            return summonerStatsRepository.findBySummonerIdAndQueueType(summonerId, queueType);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
        }
    }
}
