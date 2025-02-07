package com.example.lolstats.domain.entity;


import com.example.lolstats.domain.dto.RankDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flex_ranks")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FlexRank {
    @Id
    private String summonerId;
    private int tier;
    @Column(name = "`rank`")
    private int rank;
    private int leaguePoints;
    private int wins;
    private int losses;

    public FlexRank(RankDto dto) {
        this.summonerId = dto.getSummonerId();
        this.leaguePoints = dto.getLeaguePoints();
        this.wins = dto.getWins();
        this.losses = dto.getLosses();

        switch (dto.getRank()) {
            case "I":
                this.rank = 1;
                break;
            case "II":
                this.rank = 2;
                break;
            case "III":
                this.rank = 3;
                break;
            case "IV":
                this.rank = 4;
                break;
        }

        switch (dto.getTier()) {
            case "IRON":
                this.tier = 1;
                break;
            case "BRONZE":
                this.tier = 2;
                break;
            case "SILVER":
                this.tier = 3;
                break;
            case "GOLD":
                this.tier = 4;
                break;
            case "PLATINUM":
                this.tier = 5;
                break;
            case "EMERALD":
                this.tier = 6;
                break;
            case "DIAMOND":
                this.tier = 7;
                break;
            case "MASTER":
                this.tier = 8;
                break;
            case "GRANDMASTER":
                this.tier = 9;
                break;
            case "CHALLENGER":
                this.tier = 10;
                break;
            default:
                this.tier = 0;
                break;
        }
    }
}
