package com.example.lolstats.domain.dto;

import com.example.lolstats.domain.entity.SummonerStats;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummonerStatsDto {
    private String summonerId;
    private String queueType;
    private String htmlContent;
}
