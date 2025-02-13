package com.example.lolstats.domain.repository;

import com.example.lolstats.domain.entity.FlexRank;
import com.example.lolstats.domain.entity.SoloRank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FlexRankRepository extends JpaRepository<FlexRank, Long> {
    FlexRank findBySummonerId(String summonerId);

    @Query("SELECT fr FROM FlexRank fr JOIN FETCH fr.summoner s WHERE fr.tier <> 0 AND fr.summonerId = s.id ORDER BY fr.tier DESC, fr.rank DESC, fr.leaguePoints DESC")
    Page<?> findAllFlexRank(Pageable pageable);
}
