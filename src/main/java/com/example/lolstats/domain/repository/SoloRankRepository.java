package com.example.lolstats.domain.repository;

import com.example.lolstats.domain.entity.FlexRank;
import com.example.lolstats.domain.entity.SoloRank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SoloRankRepository extends JpaRepository<SoloRank, Long> {
    SoloRank findBySummonerId(String summonerId);
}
