package com.example.lolstats.domain.repository;

import com.example.lolstats.domain.dto.SummonerDto;
import com.example.lolstats.domain.entity.Summoner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SummonerRepository extends JpaRepository<Summoner, String> {
    Summoner findByGameNameAndTagLine(String gameName, String tagLine);
    Optional<Summoner> findById(String id);
}
