package com.example.lolsearch.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Data
public class CustomException extends RuntimeException {
    private final HttpStatus status;
    private final String message;
}
