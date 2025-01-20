package com.example.lolsearch.service;

import com.example.lolsearch.exception.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class LolServiceImpl implements LolService {
    private final WebClient webClient;

    // 생성자 주입으로 WebClient 초기화
    public LolServiceImpl(@Value("${riot.api.key}") String RIOT_API_KEY) {
        this.webClient = WebClient.builder()
                .baseUrl("https://asia.api.riotgames.com")
                .defaultHeader("X-Riot-Token", RIOT_API_KEY)
                .build();
    }

    @Override
    public Mono<String> getMatch(String matchId) {
        // 비동기 방식 처리를 위해 Mono 타입으로 return
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/lol/match/v5/matches/{matchId}")
                        .build(matchId))
                .retrieve() // 요청을 보내고 응답을 받음
                .bodyToMono(String.class) // 응답을 문자열로 받기
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getResponseBodyAsString()))
                )
                .onErrorResume(TimeoutException.class, e -> Mono.error(new CustomException(HttpStatus.REQUEST_TIMEOUT, "Request timeout"))
                )
                .onErrorResume(Exception.class, e -> {
                    // 이미 CustomException인 경우, 처리하지 않고 그대로 반환
                    if (e instanceof CustomException) {
                        return Mono.error(e);
                    }
                    log.error("Unexpected Exception occurred: {}", e.getMessage());
                    return Mono.error(new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage()));
                });
    }

    @Override
    public Mono<String> getMatchList(String puuid, int start, long startTime) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                        .queryParam("startTime", startTime)
                        .queryParam("start", start)
                        .build(puuid))
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getResponseBodyAsString()))
                )
                .onErrorResume(TimeoutException.class, e -> Mono.error(new CustomException(HttpStatus.REQUEST_TIMEOUT, "Request timeout"))
                )
                .onErrorResume(Exception.class, e -> {
                    // 이미 CustomException인 경우, 처리하지 않고 그대로 반환
                    if (e instanceof CustomException) {
                        return Mono.error(e);
                    }
                    log.error("Unexpected Exception occurred: {}", e.getMessage());
                    return Mono.error(new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage()));
                });
    }

    @Override
    public Mono<String> getPuuid(String summonerName) {
        String[] summonerNames = summonerName.split("#");
        String gameName = summonerNames[0];
        String tagLine = summonerNames[1];

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}")
                        .build(gameName, tagLine))
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getResponseBodyAsString()))
                )
                .onErrorResume(TimeoutException.class, e -> Mono.error(new CustomException(HttpStatus.REQUEST_TIMEOUT, "Request timeout"))
                )
                .onErrorResume(Exception.class, e -> {
                    // 이미 CustomException인 경우, 처리하지 않고 그대로 반환
                    if (e instanceof CustomException) {
                        return Mono.error(e);
                    }
                    log.error("Unexpected Exception occurred: {}", e.getMessage());
                    return Mono.error(new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage()));
                });
    }



    @Override
    public Mono<String> getAccount(String puuid) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/riot/account/v1/accounts/by-puuid/{puuid}")
                        .build(puuid))
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getResponseBodyAsString()))
                )
                .onErrorResume(TimeoutException.class, e -> Mono.error(new CustomException(HttpStatus.REQUEST_TIMEOUT, "Request timeout"))
                )
                .onErrorResume(Exception.class, e -> {
                    // 이미 CustomException인 경우, 처리하지 않고 그대로 반환
                    if (e instanceof CustomException) {
                        return Mono.error(e);
                    }
                    log.error("Unexpected Exception occurred: {}", e.getMessage());
                    return Mono.error(new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage()));
                });
    }

    @Override
    public Mono<String> getSummoner(String puuid) {
        return webClient.get()
                .uri("https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}", puuid)
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getResponseBodyAsString()))
                )
                .onErrorResume(TimeoutException.class, e -> Mono.error(new CustomException(HttpStatus.REQUEST_TIMEOUT, "Request timeout"))
                )
                .onErrorResume(Exception.class, e -> {
                    // 이미 CustomException인 경우, 처리하지 않고 그대로 반환
                    if (e instanceof CustomException) {
                        return Mono.error(e);
                    }
                    log.error("Unexpected Exception occurred: {}", e.getMessage());
                    return Mono.error(new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage()));
                });
    }
}