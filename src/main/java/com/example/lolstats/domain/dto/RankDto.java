package com.example.lolstats.domain.dto;

import com.example.lolstats.domain.entity.FlexRank;
import com.example.lolstats.domain.entity.SoloRank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankDto {
    private String leagueId;
    private String summonerId;
    private String queueType;
    private String tier;
    private String rank;
    private int leaguePoints;
    private int wins;
    private int losses;
    private int rate;
    private Boolean hotStreak;
    private Boolean veteran;
    private Boolean freshBlood;
    private Boolean inactive;

    public RankDto(FlexRank flexRank) {
        this.summonerId = flexRank.getSummonerId();
        this.leaguePoints = flexRank.getLeaguePoints();
        this.wins = flexRank.getWins();
        this.losses = flexRank.getLosses();
        this.rate = flexRank.getRate();

        switch (flexRank.getRank()) {
            case 1:
                this.rank = "I";
                break;
            case 2:
                this.rank = "II";
                break;
            case 3:
                this.rank = "III";
                break;
            case 4:
                this.rank = "IV";
                break;
        }

        switch (flexRank.getTier()) {
            case 1:
                this.tier = "Iron";
                break;
            case 2:
                this.tier = "Bronze";
                break;
            case 3:
                this.tier = "Silver";
                break;
            case 4:
                this.tier = "Gold";
                break;
            case 5:
                this.tier = "Platinum";
                break;
            case 6:
                this.tier = "Emerald";
                break;
            case 7:
                this.tier = "Diamond";
                break;
            case 8:
                this.tier = "Master";
                break;
            case 9:
                this.tier = "Grandmaster";
                break;
            case 10:
                this.tier = "Challenger";
                break;
            default:
                this.tier = "Unranked";
                break;
        }
    }

    public RankDto(SoloRank soloRank) {
        this.summonerId = soloRank.getSummonerId();
        this.leaguePoints = soloRank.getLeaguePoints();
        this.wins = soloRank.getWins();
        this.losses = soloRank.getLosses();
        this.rate = soloRank.getRate();

        switch (soloRank.getRank()) {
            case 1:
                this.rank = "I";
                break;
            case 2:
                this.rank = "II";
                break;
            case 3:
                this.rank = "III";
                break;
            case 4:
                this.rank = "IV";
                break;
        }
        switch (soloRank.getTier()) {
            case 1:
                this.tier = "Iron";
                break;
            case 2:
                this.tier = "Bronze";
                break;
            case 3:
                this.tier = "Silver";
                break;
            case 4:
                this.tier = "Gold";
                break;
            case 5:
                this.tier = "Platinum";
                break;
            case 6:
                this.tier = "Emerald";
                break;
            case 7:
                this.tier = "Diamond";
                break;
            case 8:
                this.tier = "Master";
                break;
            case 9:
                this.tier = "Grandmaster";
                break;
            case 10:
                this.tier = "Challenger";
                break;
            default:
                this.tier = "Unranked";
                break;
        }
    }
}
