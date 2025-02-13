package com.example.lolstats.service;

import com.example.lolstats.domain.entity.FlexRank;
import com.example.lolstats.domain.entity.SoloRank;
import com.example.lolstats.domain.repository.FlexRankRepository;
import com.example.lolstats.domain.repository.SoloRankRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class RankingServiceImpl implements RankingService {
    private final SoloRankRepository soloRankRepository;
    private final FlexRankRepository flexRankRepository;

    public RankingServiceImpl(SoloRankRepository soloRankRepository, FlexRankRepository flexRankRepository) {
        this.soloRankRepository = soloRankRepository;
        this.flexRankRepository = flexRankRepository;
    }

    @Override
    public Page<?> getAllRankings(String queueType, Pageable pageable) {
        return queueType.equals("SOLORANK") ? soloRankRepository.findAllSoloRank(pageable) : flexRankRepository.findAllFlexRank(pageable);
    }

    @Override
    public Page<?> getRankingsByTier(String tier, String queueType, Pageable pageable) {
        return null;
    }
}
