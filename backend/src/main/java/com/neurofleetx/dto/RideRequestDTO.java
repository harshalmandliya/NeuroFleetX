package com.neurofleetx.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RideRequestDTO {
    private Long id;
    private double originLat;
    private double originLng;
    private double destLat;
    private double destLng;
    private double trafficIndex;
    private String weather;
    private Long assignedTaxiId;
    private double eta;
    private String status;
}