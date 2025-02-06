package com.example.lolstats.domain.dto;

import com.example.lolstats.domain.entity.Summoner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummonerDto {
    private String id;
    private String accountId;
    private String puuid;
    private String gameName;
    private String tagLine;
    private int profileIconId;
    private long revisionDate;
    private int summonerLevel;

    public SummonerDto(Summoner summoner) {
        this.puuid = summoner.getPuuid();
        this.gameName = summoner.getGameName();
        this.tagLine = summoner.getTagLine();
        this.id = summoner.getId();
        this.accountId = summoner.getAccountId();
        this.profileIconId = summoner.getProfileIconId();
        this.revisionDate = summoner.getRevisionDate();
        this.summonerLevel = summoner.getSummonerLevel();
    }
}
