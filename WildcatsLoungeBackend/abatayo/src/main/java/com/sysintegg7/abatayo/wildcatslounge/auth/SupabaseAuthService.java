package com.sysintegg7.abatayo.wildcatslounge.auth;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SupabaseAuthService {

    private final HttpClient httpClient;

    @Value("${app.supabase.url:}")
    private String supabaseUrl;

    @Value("${app.supabase.anon-key:}")
    private String supabaseAnonKey;

    public SupabaseAuthService() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public boolean isConfigured() {
        return supabaseUrl != null
                && !supabaseUrl.isBlank()
                && supabaseAnonKey != null
                && !supabaseAnonKey.isBlank();
    }

    public SupabaseAuthResult signIn(String email, String password) {
        if (!isConfigured()) {
            return SupabaseAuthResult.builder()
                    .configured(false)
                    .success(false)
                    .message("Supabase auth is not configured")
                    .build();
        }

        String payload = "{\"email\":\"" + escapeJson(email) + "\",\"password\":\"" + escapeJson(password) + "\"}";
        return sendAuthRequest("/auth/v1/token?grant_type=password", payload);
    }

    public SupabaseAuthResult signUp(String email, String password, String firstName, String lastName) {
        if (!isConfigured()) {
            return SupabaseAuthResult.builder()
                    .configured(false)
                    .success(false)
                    .message("Supabase auth is not configured")
                    .build();
        }

        String payload = "{\"email\":\"" + escapeJson(email) + "\",\"password\":\"" + escapeJson(password)
            + "\",\"data\":{\"first_name\":\"" + escapeJson(firstName)
            + "\",\"last_name\":\"" + escapeJson(lastName) + "\"}}";

        return sendAuthRequest("/auth/v1/signup", payload);
    }

        private SupabaseAuthResult sendAuthRequest(String path, String payload) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(trimTrailingSlash(supabaseUrl) + path))
                    .header("apikey", supabaseAnonKey)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body() == null ? "" : response.body();

            if (response.statusCode() >= HttpStatus.OK.value() && response.statusCode() < HttpStatus.MULTIPLE_CHOICES.value()) {
                return SupabaseAuthResult.builder()
                        .configured(true)
                        .success(true)
                        .message("Supabase authentication successful")
                .accessToken(extractString(responseBody, "access_token"))
                .refreshToken(extractString(responseBody, "refresh_token"))
                .expiresIn(extractLong(responseBody, "expires_in"))
                        .build();
            }

            String errorMessage = firstNonBlank(
                extractString(responseBody, "msg"),
                extractString(responseBody, "error_description"),
                extractString(responseBody, "message"),
                "Supabase authentication failed"
            );

            return SupabaseAuthResult.builder()
                    .configured(true)
                    .success(false)
                    .message(errorMessage)
                    .build();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return SupabaseAuthResult.builder()
                .configured(true)
                .success(false)
                .message("Supabase authentication request failed")
                .build();
        } catch (IOException e) {
            return SupabaseAuthResult.builder()
                    .configured(true)
                    .success(false)
                    .message("Supabase authentication request failed")
                    .build();
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String extractString(String json, String key) {
        Pattern pattern = Pattern.compile("\\\"" + Pattern.quote(key) + "\\\"\\s*:\\s*\\\"([^\\\"]*)\\\"");
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    private long extractLong(String json, String key) {
        Pattern pattern = Pattern.compile("\\\"" + Pattern.quote(key) + "\\\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException ignored) {
                return 0L;
            }
        }
        return 0L;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}