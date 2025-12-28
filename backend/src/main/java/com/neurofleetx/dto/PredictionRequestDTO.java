package com.neurofleetx.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionRequestDTO {
    private double originLat;
    private double originLng;
    private double destLat;
    private double destLng;
    private double trafficIndex;  // Used for prediction but auto-generated for actual ride requests
    private String weather;       // Used for prediction but auto-generated for actual ride requests
    private String timeOfDay;     // Time of day for prediction (morning, afternoon, evening, night)
}