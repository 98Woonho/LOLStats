package com.example.lolstats.domain.repository;

import com.example.lolstats.domain.entity.FlexRank;
import com.example.lolstats.domain.entity.SoloRank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SoloRankRepository extends JpaRepository<SoloRank, Long> {
    SoloRank findBySummonerId(String summonerId);

    @Query("SELECT sr FROM SoloRank sr JOIN FETCH sr.summoner s WHERE sr.tier <> 0 AND sr.summonerId = s.id ORDER BY sr.tier DESC, sr.rank DESC, sr.leaguePoints DESC")
    Page<?> findAllSoloRank(Pageable pageable);
}
