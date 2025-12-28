package com.neurofleetx.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "taxi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Taxi {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private double latitude;
    
    private double longitude;
    
    private int batteryLevel;
    
    @Enumerated(EnumType.STRING)
    private TaxiStatus status;
    
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;
    
    public enum TaxiStatus {
        AVAILABLE, BUSY, CHARGING
    }
}