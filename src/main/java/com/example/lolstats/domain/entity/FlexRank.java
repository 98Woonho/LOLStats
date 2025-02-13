package com.example.lolstats.domain.entity;


import com.example.lolstats.domain.dto.RankDto;
import jakarta.persistence.*;
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
    private int rate;

    @OneToOne(fetch = FetchType.LAZY)  // 지연 로딩 (필요시 즉시 로딩 EAGER로 설정)
    @JoinColumn(name = "summoner_id")  // 외래키 컬럼명
    private Summoner summoner;  // 소환사 정보

    // 생성자에서 summoner를 null로 설정
    public FlexRank(String summonerId, int tier, int rank, int leaguePoints, int wins, int losses, int rate) {
        this.summonerId = summonerId;
        this.tier = tier;
        this.rank = rank;
        this.leaguePoints = leaguePoints;
        this.wins = wins;
        this.losses = losses;
        this.rate = rate;
        this.summoner = null;  // 'summoner'는 null
    }

    public FlexRank(RankDto dto) {
        this.summonerId = dto.getSummonerId();
        this.leaguePoints = dto.getLeaguePoints();
        this.wins = dto.getWins();
        this.losses = dto.getLosses();
        this.rate = (int) ((double) dto.getWins() / (dto.getWins() + dto.getLosses()) * 100);


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
