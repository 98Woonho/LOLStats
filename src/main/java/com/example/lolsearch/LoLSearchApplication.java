package com.example.lolsearch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class LoLSearchApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoLSearchApplication.class, args);
    }

}
