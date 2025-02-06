package com.example.lolstats.domain.repository;

import com.example.lolstats.domain.entity.FlexRank;
import com.example.lolstats.domain.entity.SoloRank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlexRankRepository extends JpaRepository<FlexRank, Long> {
    FlexRank findBySummonerId(String summonerId);
}
