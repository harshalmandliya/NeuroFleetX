package com.neurofleetx.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaxiDTO {
    private Long id;
    private String name;
    private double latitude;
    private double longitude;
    private int batteryLevel;
    private String status;
    
    // Driver information
    private Long driverId;
    private String driverFirstName;
    private String driverLastName;
    private String driverEmail;
}