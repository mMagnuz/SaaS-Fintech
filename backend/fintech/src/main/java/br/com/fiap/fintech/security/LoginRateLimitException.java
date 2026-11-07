package br.com.fiap.fintech.security;

public class LoginRateLimitException extends RuntimeException {
    public LoginRateLimitException(String message) {
        super(message);
    }
}
