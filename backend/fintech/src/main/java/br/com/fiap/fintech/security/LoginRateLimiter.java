package br.com.fiap.fintech.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginRateLimiter {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration LOCKOUT = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Attempts> attempts = new ConcurrentHashMap<>();

    public void check(String key) {
        Instant now = Instant.now();
        Attempts current = attempts.compute(key, (ignored, value) -> value == null ? new Attempts(now) : value.refresh(now));
        if (current.lockedUntil != null && current.lockedUntil.isAfter(now)) {
            throw new LoginRateLimitException("Muitas tentativas de login. Tente novamente mais tarde.");
        }
    }

    public void registerFailure(String key) {
        Instant now = Instant.now();
        attempts.compute(key, (ignored, value) -> {
            Attempts current = value == null ? new Attempts(now) : value.refresh(now);
            current.count++;
            if (current.count >= MAX_ATTEMPTS) current.lockedUntil = now.plus(LOCKOUT);
            return current;
        });
    }

    public void clear(String key) {
        attempts.remove(key);
    }

    private static final class Attempts {
        private Instant startedAt;
        private int count;
        private Instant lockedUntil;

        private Attempts(Instant startedAt) {
            this.startedAt = startedAt;
        }

        private Attempts refresh(Instant now) {
            if (Duration.between(startedAt, now).compareTo(WINDOW) >= 0) {
                startedAt = now;
                count = 0;
                lockedUntil = null;
            }
            return this;
        }
    }
}
