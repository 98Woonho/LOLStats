package com.example.lolstats.controller;

import com.example.lolstats.domain.dto.SummonerDto;
import com.example.lolstats.service.LolService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@Slf4j
@RequestMapping(value = "/summoners")
public class SummonersController {
    private final LolService lolService;

    public SummonersController(LolService lolService) {
        this.lolService = lolService;
    }

    @GetMapping("/{summonerName}/{queueType}")
    public String getSummonersView() {
        return "summoners";
    }

    @GetMapping("/{summonerName}")
    @ResponseBody
    public SummonerDto getSummoner(@PathVariable("summonerName") String summonerName) {
        return lolService.getSummoner(summonerName);
    }
}
