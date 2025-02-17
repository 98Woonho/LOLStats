package com.example.lolstats.domain.entity;

import com.example.lolstats.domain.dto.SummonerStatsDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "summoner_stats")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SummonerStats {
    @Id
    private long id;
    private String summonerId;
    private String queueType;

    @Lob // 대용량 데이터 매핑
    @Column(columnDefinition = "LONGTEXT") // 명확하게 LONGTEXT로 지정
    private String htmlContent;

    public SummonerStats(SummonerStatsDto summonerStatsDto) {
        this.summonerId = summonerStatsDto.getSummonerId();
        this.queueType = summonerStatsDto.getQueueType();
        this.htmlContent = summonerStatsDto.getHtmlContent();
    }
}