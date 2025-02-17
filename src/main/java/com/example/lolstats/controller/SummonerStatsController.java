package com.example.lolstats.controller;

import com.example.lolstats.domain.dto.SummonerStatsDto;
import com.example.lolstats.domain.entity.SummonerStats;
import com.example.lolstats.service.SummonerStatsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@Slf4j
@RequestMapping(value = "/summonerStats")
public class SummonerStatsController {
    private final SummonerStatsService summonerStatsService;

    public SummonerStatsController(SummonerStatsService summonerStatsService) {
        this.summonerStatsService = summonerStatsService;
    }

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<?> getSummonerStats(@RequestParam(value = "summonerId") String summonerId,
                                              @RequestParam(value = "queueType") String queueType) {
        SummonerStats summonerStats = summonerStatsService.getSummonerStats(summonerId, queueType);

        // summonerStats가 null일 경우, null을 반환
        if (summonerStats == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(summonerStats.getHtmlContent());
    }

    @PostMapping("")
    @ResponseBody
    public ResponseEntity<?> postSummonerStats(@RequestBody SummonerStatsDto summonerStatsDto) {
        SummonerStats summonerStats = summonerStatsService.addSummonerStats(summonerStatsDto);
        return ResponseEntity.ok(summonerStats);
    }
}
