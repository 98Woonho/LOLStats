package com.example.lolstats.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSourceConfig {
    @Bean
    public HikariDataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://3.39.136.140:3306/lol_stats");
        dataSource.setUsername("awsdb");
        dataSource.setPassword("Woonho98@@!!");

        return dataSource;
    }
}