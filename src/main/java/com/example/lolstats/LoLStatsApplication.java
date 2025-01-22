package com.example.lolstats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class LoLStatsApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoLStatsApplication.class, args);
    }

}
