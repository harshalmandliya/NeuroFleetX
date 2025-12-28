package com.neurofleetx.controller;

import com.neurofleetx.model.RideRequest;
import com.neurofleetx.service.AIService;
import com.neurofleetx.service.RideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private RideRequestService rideRequestService;

    @Autowired
    private AIService aiService;

    @PostMapping("/explain-ride/{rideId}")
    public ResponseEntity<String> explainRide(@PathVariable Long rideId) {
        try {
            // Fetch ride data
            RideRequest ride = rideRequestService.getRideRequestById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

            // Convert traffic index to a readable format
            String trafficLevel = convertTrafficIndex(ride.getTrafficIndex());
            
            // Get weather condition
            String weather = ride.getWeather() != null ? ride.getWeather() : "clear";
            
            // Get ETA, totalTime, fare, status
            double eta = ride.getEta();
            double totalTime = eta; // For now, we'll use ETA as totalTime
            double fare = ride.getEarnings();
            String status = ride.getStatus() != null ? ride.getStatus().toString() : "UNKNOWN";

            // Generate explanation using AI service
            String explanation = aiService.explainRide(status, eta, totalTime, fare, trafficLevel, weather);

            return ResponseEntity.ok(explanation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Unable to explain ride: " + e.getMessage());
        }
    }

    private String convertTrafficIndex(double trafficIndex) {
        if (trafficIndex >= 0.8) {
            return "heavy";
        } else if (trafficIndex >= 0.6) {
            return "moderate";
        } else if (trafficIndex >= 0.4) {
            return "light";
        } else {
            return "clear";
        }
    }
}