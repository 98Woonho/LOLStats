package com.example.lolstats.domain.entity;

import com.example.lolstats.domain.dto.SummonerDto;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "summoners")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Summoner {
    @Id
    private String id;
    private String puuid;
    private String accountId;
    private String gameName;
    private String tagLine;
    private int profileIconId;
    private long revisionDate;
    private int summonerLevel;

    public Summoner(SummonerDto dto) {
        this.puuid = dto.getPuuid();
        this.gameName = dto.getGameName();
        this.tagLine = dto.getTagLine();
        this.id = dto.getId();
        this.accountId = dto.getAccountId();
        this.profileIconId = dto.getProfileIconId();
        this.revisionDate = dto.getRevisionDate();
        this.summonerLevel = dto.getSummonerLevel();
    }
}
