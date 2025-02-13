package com.example.lolstats.controller;

import com.example.lolstats.service.RankingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@Slf4j
@RequestMapping(value = "/rankings")
public class RankingsController {
    private final RankingService rankingService;

    public RankingsController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping("")
    public String getRankingsView(@RequestParam(value = "tier", required = false, defaultValue = "All") String tier,
                                  @RequestParam(value = "queueType", required = false, defaultValue = "SOLORANK") String queueType,
                                  @RequestParam(value = "page", defaultValue = "0") int page,
                                  Model model) {
        Pageable pageable = PageRequest.of(page, 50);

        Page<?> rankingsPage;

        if ("All".equals(tier)) {
            rankingsPage = rankingService.getAllRankings(queueType, pageable);
        } else {
            rankingsPage = rankingService.getRankingsByTier(tier, queueType, pageable);
        }

        model.addAttribute("rankingsPage", rankingsPage);
        model.addAttribute("tier", tier);

        return "rankings";
    }
}
