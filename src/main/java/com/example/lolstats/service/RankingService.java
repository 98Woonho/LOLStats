package com.example.lolstats.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RankingService {
    Page<?> getAllRankings(String queueType, Pageable pageable);
    Page<?> getRankingsByTier(String tier, String queueType, Pageable pageable);
}
