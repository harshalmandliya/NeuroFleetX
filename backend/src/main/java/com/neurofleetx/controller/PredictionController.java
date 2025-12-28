package com.neurofleetx.controller;

import com.neurofleetx.dto.PredictionRequestDTO;
import com.neurofleetx.dto.PredictionResponseDTO;
import com.neurofleetx.ml.ETAPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predict")
@CrossOrigin(origins = "*")
public class PredictionController {
    
    @Autowired
    private ETAPredictionService etaPredictionService;
    
    @PostMapping
    public ResponseEntity<PredictionResponseDTO> predictETA(@RequestBody PredictionRequestDTO request) {
        // Use default time of day if not provided
        String timeOfDay = request.getTimeOfDay();
        if (timeOfDay == null || timeOfDay.trim().isEmpty()) {
            timeOfDay = "afternoon"; // Default time of day
        }
        
        double predictedETA = etaPredictionService.predictETA(
                request.getOriginLat(),
                request.getOriginLng(),
                request.getDestLat(),
                request.getDestLng(),
                request.getTrafficIndex(),
                request.getWeather(),
                timeOfDay
        );
        
        PredictionResponseDTO response = new PredictionResponseDTO();
        response.setPredictedETA(predictedETA);
        
        return ResponseEntity.ok(response);
    }
}