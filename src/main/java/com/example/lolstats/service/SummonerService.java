package com.example.lolstats.service;

import com.example.lolstats.domain.entity.Summoner;
import com.example.lolstats.domain.repository.SummonerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SummonerService {
    @Autowired
    private SummonerRepository summonerRepository;

    public boolean addSummoner(Summoner summoner) {
        return summonerRepository.save(summoner) != null;
    }
}
