package com.example.lolstats.domain.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RanksDto {
    private RankDto soloRank;
    private RankDto flexRank;
}