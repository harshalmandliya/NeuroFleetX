package com.neurofleetx.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "ride_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RideRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private double originLat;
    
    private double originLng;
    
    private double destLat;
    
    private double destLng;
    
    private double trafficIndex;
    
    private String weather;
    
    private Long assignedTaxiId;
    
    private double eta;
    
    @Enumerated(EnumType.STRING)
    private RideStatus status;
    
    public enum RideStatus {
        PENDING, ASSIGNED, COMPLETED
    }
}