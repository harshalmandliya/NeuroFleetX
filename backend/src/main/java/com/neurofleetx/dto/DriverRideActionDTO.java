package com.neurofleetx.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverRideActionDTO {
    private Long rideRequestId;
    private String action; // "ACCEPT" or "DECLINE"
}