package com.sysintegg7.abatayo.wildcatslounge.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SendGridEmailService {

    private static final Logger logger = LoggerFactory.getLogger(SendGridEmailService.class);
    private static final String SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

    @Value("${sendgrid.api-key}")
    private String apiKey;

    @Value("${app.mail.from-address:noreply@wildcatslounge.com}")
    private String fromEmail;

    private final RestTemplate restTemplate;

    public SendGridEmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendEmail(String toEmail, String subject, String htmlContent) {
        try {
        if (apiKey == null || apiKey.trim().isEmpty()) {
          logger.warn("SENDGRID_API_KEY is not configured. Skipping email to {}", toEmail);
          return;
        }

        logger.info("Sending email via SendGrid to: {}", toEmail);

        // Build SendGrid API request JSON manually
        String requestBody = buildSendGridRequest(toEmail, subject, htmlContent);

        // Create headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // Send request and log response
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
        String response = restTemplate.postForObject(SENDGRID_API_URL, entity, String.class);

        logger.info("SendGrid response (may be empty): {}", response);
        logger.info("Email send attempt completed for: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email via SendGrid to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String buildSendGridRequest(String toEmail, String subject, String htmlContent) {
        return """
            {
              "personalizations": [
                {
                  "to": [
                    {
                      "email": "%s"
                    }
                  ],
                  "subject": "%s"
                }
              ],
              "from": {
                "email": "%s",
                "name": "Wildcats Lounge"
              },
              "content": [
                {
                  "type": "text/html",
                  "value": "%s"
                }
              ]
            }
            """.formatted(
                escapeJson(toEmail),
                escapeJson(subject),
                escapeJson(fromEmail),
                escapeJson(htmlContent)
            );
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}

