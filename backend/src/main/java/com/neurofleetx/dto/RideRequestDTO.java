package com.neurofleetx.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RideRequestDTO {
    private Long id;
    private double originLat;
    private double originLng;
    private double destLat;
    private double destLng;
    private double trafficIndex = 0.0;  // Default value, will be auto-generated if not provided
    private String weather = "";        // Default value, will be auto-generated if not provided
    private Long assignedTaxiId;
    private double eta;
    private double earnings; // Earnings for the driver
    private String status;
    private LocalDateTime timestamp;
}