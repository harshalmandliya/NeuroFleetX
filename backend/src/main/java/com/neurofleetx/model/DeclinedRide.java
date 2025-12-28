package com.neurofleetx.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "declined_ride", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ride_request_id", "driver_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeclinedRide {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ride_request_id", nullable = false)
    private RideRequest rideRequest;
    
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;
    
    private LocalDateTime declinedAt;
    
    @PrePersist
    protected void onCreate() {
        if (declinedAt == null) {
            declinedAt = LocalDateTime.now();
        }
    }
}