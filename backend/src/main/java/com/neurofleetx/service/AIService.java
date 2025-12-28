package com.neurofleetx.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.HashMap;

@Service
public class AIService {

    @Value("${openai.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String explainRide(String status, double eta, double totalTime, double fare, String traffic, String weather) {
        // If no API key is configured, return a default explanation
        if (apiKey == null || apiKey.isEmpty()) {
            return generateDefaultExplanation(status, eta, totalTime, fare, traffic, weather);
        }

        String prompt = "";
        
        if ("PENDING".equals(status)) {
            prompt = String.format("""
                Greet the customer and explain the pending ride in ONE short sentence.

                Ride status: PENDING
                ETA: %.0f minutes
                Fare: ₹%.2f
                Traffic: %s
                Weather: %s

                Tell the customer what to expect next.
                """, eta, fare, traffic, weather);
        } else if ("IN_PROGRESS".equals(status)) {
            prompt = String.format("""
                Greet the customer and explain the ongoing ride in ONE short sentence.

                Ride status: IN_PROGRESS
                ETA: %.0f minutes
                Fare: ₹%.2f
                Traffic: %s
                Weather: %s

                Explain the current progress clearly.
                """, eta, fare, traffic, weather);
        } else if ("COMPLETED".equals(status)) {
            prompt = String.format("""
                Greet the customer and summarize the completed ride in ONE short sentence.

                Ride status: COMPLETED
                Total time: %.0f minutes
                Fare paid: ₹%.2f
                Traffic during ride: %s
                Weather during ride: %s

                Provide a brief insight about the ride experience.
                """, totalTime, fare, traffic, weather);
        } else {
            // Fallback for unknown status
            prompt = String.format("""
                Explain this ride in simple words.

                Status: %s
                ETA: %.0f minutes
                Fare: ₹%.2f
                Traffic: %s
                Weather: %s
                
                Provide a concise, friendly explanation in a single sentence.
                """, status, eta, fare, traffic, weather);
        }

        try {
            String response = callOpenAI(prompt);
            return extractContentFromResponse(response);
        } catch (Exception e) {
            // Fallback to default explanation if OpenAI call fails
            return generateDefaultExplanation(status, eta, totalTime, fare, traffic, weather);
        }
    }

    private String callOpenAI(String prompt) {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", new Object[]{
            Map.of("role", "user", "content", prompt)
        });
        requestBody.put("max_tokens", 100);
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
        return response.getBody();
    }

    private String extractContentFromResponse(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode choices = rootNode.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode firstChoice = choices.get(0);
                JsonNode message = firstChoice.path("message");
                JsonNode content = message.path("content");
                if (content.isTextual()) {
                    return content.asText().trim();
                }
            }
        } catch (Exception e) {
            // If parsing fails, log the error and return a default message
            System.err.println("Error parsing OpenAI response: " + e.getMessage());
        }
        return "I'm having trouble explaining your ride right now. Please try again later.";
    }

    private String generateDefaultExplanation(String status, double eta, double totalTime, double fare, String traffic, String weather) {
        StringBuilder explanation = new StringBuilder("Hi! ");
        
        if ("PENDING".equals(status)) {
            explanation.append("Your ride is being arranged and is expected to start soon, with an estimated arrival time of ")
                      .append(Math.round(eta)).append(" minutes considering current traffic and weather.");
        } else if ("IN_PROGRESS".equals(status)) {
            explanation.append("Your ride is currently in progress and should reach the destination in about ")
                      .append(Math.round(eta)).append(" minutes, with traffic and weather affecting the timing slightly.");
        } else if ("COMPLETED".equals(status)) {
            explanation.append("Your ride was completed in ").append(Math.round(totalTime))
                      .append(" minutes, with the fare influenced by traffic and weather conditions during the trip.");
        } else {
            // Default fallback for any other status
            if ("high".equals(traffic) || "rainy".equals(weather) || "snowy".equals(weather)) {
                explanation.append("Your ride is slightly delayed ");
                
                if ("high".equals(traffic)) {
                    explanation.append("due to heavy traffic");
                    if ("rainy".equals(weather) || "snowy".equals(weather)) {
                        explanation.append(" and ");
                    }
                }
                
                if ("rainy".equals(weather)) {
                    explanation.append("rainy conditions");
                } else if ("snowy".equals(weather)) {
                    explanation.append("snowy conditions");
                }
            } else {
                explanation.append("Your ride is on track");
            }
            
            explanation.append(". Estimated arrival in ").append(Math.round(eta)).append(" minutes.");
        }
        
        return explanation.toString();
    }
}