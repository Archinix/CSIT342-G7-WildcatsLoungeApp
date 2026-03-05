package com.sysintegg7.abatayo.wildcatslounge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret = "your-secret-key-change-in-production-with-at-least-256-bits-of-entropy";
    private long expiration = 86400000L;
    private Refresh refresh = new Refresh();

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }

    public Refresh getRefresh() {
        return refresh;
    }

    public void setRefresh(Refresh refresh) {
        this.refresh = refresh;
    }

    public static class Refresh {
        private long expiration = 604800000L;

        public long getExpiration() {
            return expiration;
        }

        public void setExpiration(long expiration) {
            this.expiration = expiration;
        }
    }
}
