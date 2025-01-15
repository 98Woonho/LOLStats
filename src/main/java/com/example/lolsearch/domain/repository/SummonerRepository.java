package com.example.lolsearch.domain.repository;

import com.example.lolsearch.domain.entity.Summoner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SummonerRepository extends JpaRepository<Summoner, String> {

}
