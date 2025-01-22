package com.example.lolstats.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Data
public class CustomException extends RuntimeException {
    private final HttpStatus status;
    private final String message;
}
