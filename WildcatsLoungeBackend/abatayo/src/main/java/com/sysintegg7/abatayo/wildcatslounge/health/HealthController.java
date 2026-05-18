package com.sysintegg7.abatayo.wildcatslounge.health;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean databaseHealthy = isDatabaseHealthy();
        HttpStatus status = databaseHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", databaseHealthy ? "UP" : "DOWN");
        body.put("database", databaseHealthy ? "UP" : "DOWN");
        body.put("timestamp", Instant.now().toString());

        return ResponseEntity.status(status).body(body);
    }

    private boolean isDatabaseHealthy() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2);
        } catch (SQLException ex) {
            return false;
        }
    }
}