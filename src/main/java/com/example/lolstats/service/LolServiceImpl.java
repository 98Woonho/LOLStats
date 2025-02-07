package com.example.lolstats.service;

import com.example.lolstats.domain.dto.RankDto;
import com.example.lolstats.domain.dto.RanksDto;
import com.example.lolstats.domain.dto.SummonerDto;
import com.example.lolstats.domain.entity.FlexRank;
import com.example.lolstats.domain.entity.SoloRank;
import com.example.lolstats.domain.entity.Summoner;
import com.example.lolstats.domain.repository.FlexRankRepository;
import com.example.lolstats.domain.repository.SoloRankRepository;
import com.example.lolstats.domain.repository.SummonerRepository;
import com.example.lolstats.exception.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriBuilder;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class LolServiceImpl implements LolService {
    private final WebClient webClient;
    private final SummonerRepository summonerRepository;
    private final FlexRankRepository flexRankRepository;
    private final SoloRankRepository soloRankRepository;

    // 생성자 주입으로 WebClient 초기화
    public LolServiceImpl(@Value("${riot.api.key}") String RIOT_API_KEY, SummonerRepository summonerRepository, FlexRankRepository flexRankRepository, SoloRankRepository soloRankRepository) {
        this.webClient = WebClient.builder()
                .baseUrl("https://asia.api.riotgames.com")
                .defaultHeader("X-Riot-Token", RIOT_API_KEY)
                .build();
        this.summonerRepository = summonerRepository;
        this.flexRankRepository = flexRankRepository;
        this.soloRankRepository = soloRankRepository;
    }

    @Override
    public Mono<String> getMatch(String matchId) {
        // 비동기 방식 처리를 위해 Mono 타입으로 return
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/lol/match/v5/matches/{matchId}")
                        .build(matchId))
                .retrieve() // 요청을 보내고 응답을 받음
                .bodyToMono(String.class) // 응답을 문자열로 받기
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getMessage()))
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
    public Mono<String> getMatchList(String puuid, int start, long startTime, int queue) {
        return webClient.get()
                .uri(uriBuilder -> {
                    UriBuilder builder = uriBuilder.path("/lol/match/v5/matches/by-puuid/{puuid}/ids")
                            .queryParam("startTime", startTime)
                            .queryParam("start", start);

                    if (queue != 0) {
                        builder = builder.queryParam("queue", queue);
                    }

                    return builder.build(puuid);
                })
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getMessage()))
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
                .onErrorResume(WebClientResponseException.class, e -> Mono.error(new CustomException(HttpStatus.valueOf(e.getStatusCode().value()), e.getMessage()))
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
    public SummonerDto getSummoner(String summonerName) {
        String[] summonerNames = summonerName.split("#");
        String gameName = summonerNames[0];
        String tagLine = summonerNames[1];

        Summoner existingSummoner = summonerRepository.findByGameNameAndTagLine(gameName, tagLine);

        if (existingSummoner == null) {
            try {
                SummonerDto account = webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}")
                                .build(gameName, tagLine))
                        .retrieve()
                        .bodyToMono(SummonerDto.class)
                        .block();

                SummonerDto summoner = webClient.get()
                        .uri("https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}", account.getPuuid())
                        .retrieve()
                        .bodyToMono(SummonerDto.class)
                        .block();

                // account + summoner 데이터를 합친 summonerDto
                SummonerDto summonerDto = SummonerDto.builder()
                        .id(summoner.getId())
                        .accountId(summoner.getAccountId())
                        .puuid(summoner.getPuuid())
                        .profileIconId(summoner.getProfileIconId())
                        .revisionDate(summoner.getRevisionDate())
                        .summonerLevel(summoner.getSummonerLevel())
                        .gameName(account.getGameName())
                        .tagLine(account.getTagLine())
                        .build();

                Summoner newSummoner = new Summoner(summonerDto);
                summonerRepository.save(newSummoner);

                return summonerDto;
            } catch (WebClientResponseException e) {
                HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());

                if (status == null) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                }

                if (status == HttpStatus.NOT_FOUND) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "소환사를 찾을 수 없습니다. 게임 이름과 태그를 다시 한 번 확인 후, 재시도 해주세요.");
                }

                throw new ResponseStatusException(status, "서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
            }
        } else {
            return new SummonerDto(existingSummoner);
        }
    }

    public RanksDto getRanks(String summonerId) {
        SoloRank existingSoloRank = soloRankRepository.findBySummonerId(summonerId);
        FlexRank existingFlexRank = flexRankRepository.findBySummonerId(summonerId);

        if (existingSoloRank == null || existingFlexRank == null) {
            try {
                List<RankDto> ranks = webClient.get()
                        .uri("https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/{encryptedSummonerId}", summonerId)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<List<RankDto>>() {})
                        .block();

                SoloRank soloRank;
                FlexRank flexRank;
              
                if (ranks.isEmpty()) {
                    soloRank = new SoloRank(summonerId, 0, 0, 0, 0, 0);
                    flexRank = new FlexRank(summonerId, 0, 0, 0, 0, 0);
                } else if (ranks.size() == 1) {
                    RankDto rank = ranks.getFirst();

                    soloRank = rank.getQueueType().equals("RANKED_FLEX_SR") ? new SoloRank(summonerId, 0, 0, 0, 0, 0) : new SoloRank(rank);
                    flexRank = rank.getQueueType().equals("RANKED_FLEX_SR") ? new FlexRank(rank) : new FlexRank(summonerId, 0, 0, 0, 0, 0);
                } else {
                    soloRank = new SoloRank(ranks.get(0));
                    flexRank = new FlexRank(ranks.get(1));
                }

                soloRankRepository.save(soloRank);
                flexRankRepository.save(flexRank);

                return RanksDto.builder()
                        .soloRank(new RankDto(soloRank))
                        .flexRank(new RankDto(flexRank))
                        .build();
            } catch (WebClientResponseException e) {
                HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());

                if (status == null) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                }

                if (status == HttpStatus.NOT_FOUND) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "소환사를 찾을 수 없습니다. 게임 이름과 태그를 다시 한 번 확인 후, 재시도 해주세요.");
                }

                throw new ResponseStatusException(status, "서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
            }
        } else {
            return RanksDto.builder()
                    .soloRank(new RankDto(existingSoloRank))
                    .flexRank(new RankDto(existingFlexRank))
                    .build();
        }
    }
}