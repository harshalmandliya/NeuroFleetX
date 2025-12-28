package com.neurofleetx.controller;

import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.service.RideRequestService;
import com.neurofleetx.service.UserService;
import com.neurofleetx.service.TaxiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/database-fix")
public class DatabaseFixController {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private RideRequestService rideRequestService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TaxiService taxiService;
    
    @GetMapping("/add-earnings-column")
    public ResponseEntity<String> addEarningsColumn() {
        Connection conn = null;
        Statement stmt = null;
        
        try {
            conn = dataSource.getConnection();
            
            // Check if the earnings column already exists
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columns = metaData.getColumns(null, null, "ride_request", "earnings");
            
            if (columns.next()) {
                return ResponseEntity.ok("Database already has the earnings column");
            }
            
            // Add the earnings column to ride_request table
            stmt = conn.createStatement();
            stmt.execute("ALTER TABLE ride_request ADD COLUMN earnings DOUBLE PRECISION DEFAULT 0.0");
            return ResponseEntity.ok("Database fixed successfully - earnings column added");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fixing database: " + e.getMessage());
        } finally {
            try {
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                // Ignore
            }
        }
    }
    
    @GetMapping("/populate-sample-data")
    public ResponseEntity<String> populateSampleData() {
        try {
            // Get the user and taxi for the sample data
            Optional<User> userOpt = userService.getUserById(3L); // user1@example.com
            Optional<Taxi> taxiOpt = taxiService.getTaxiById(1L); // Taxi 1
            
            if (!userOpt.isPresent() || !taxiOpt.isPresent()) {
                return ResponseEntity.status(500).body("Required user or taxi not found");
            }
            
            User user = userOpt.get();
            Taxi taxi = taxiOpt.get();
            
            // Create sample completed rides with earnings
            RideRequest ride1 = new RideRequest();
            ride1.setOriginLat(40.7589);
            ride1.setOriginLng(-73.9851);
            ride1.setDestLat(40.7128);
            ride1.setDestLng(-74.0060);
            ride1.setTrafficIndex(0.6);
            ride1.setWeather("sunny");
            ride1.setTaxi(taxi);
            ride1.setEta(12.5);
            ride1.setEarnings(25.75);
            ride1.setStatus(RideRequest.RideStatus.COMPLETED);
            ride1.setUser(user);
            
            RideRequest ride2 = new RideRequest();
            ride2.setOriginLat(40.7589);
            ride2.setOriginLng(-73.9851);
            ride2.setDestLat(40.7128);
            ride2.setDestLng(-74.0060);
            ride2.setTrafficIndex(0.4);
            ride2.setWeather("cloudy");
            ride2.setTaxi(taxi);
            ride2.setEta(18.2);
            ride2.setEarnings(42.30);
            ride2.setStatus(RideRequest.RideStatus.COMPLETED);
            ride2.setUser(user);
            
            RideRequest ride3 = new RideRequest();
            ride3.setOriginLat(40.7589);
            ride3.setOriginLng(-73.9851);
            ride3.setDestLat(40.7128);
            ride3.setDestLng(-74.0060);
            ride3.setTrafficIndex(0.8);
            ride3.setWeather("rainy");
            ride3.setTaxi(taxi);
            ride3.setEta(22.7);
            ride3.setEarnings(67.80);
            ride3.setStatus(RideRequest.RideStatus.COMPLETED);
            ride3.setUser(user);
            
            // Save the rides
            rideRequestService.saveRideRequest(ride1);
            rideRequestService.saveRideRequest(ride2);
            rideRequestService.saveRideRequest(ride3);
            
            return ResponseEntity.ok("Sample completed rides with earnings added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error populating sample data: " + e.getMessage());
        }
    }
    
    @GetMapping("/fix-pending-ride-location")
    public ResponseEntity<String> fixPendingRideLocation() {
        try {
            // Get all pending rides
            List<RideRequest> pendingRides = rideRequestService.getUnassignedRides();
            
            if (pendingRides.isEmpty()) {
                return ResponseEntity.ok("No pending rides found");
            }
            
            // Get Taxi 1 (driver's taxi)
            Optional<Taxi> taxiOpt = taxiService.getTaxiById(1L);
            if (!taxiOpt.isPresent()) {
                return ResponseEntity.status(500).body("Taxi 1 not found");
            }
            
            Taxi taxi = taxiOpt.get();
            
            // Update the first pending ride to be near the driver's location
            RideRequest pendingRide = pendingRides.get(0);
            pendingRide.setOriginLat(taxi.getLatitude() + 0.001); // Slightly offset from driver location
            pendingRide.setOriginLng(taxi.getLongitude() + 0.001);
            pendingRide.setDestLat(taxi.getLatitude() - 0.001);
            pendingRide.setDestLng(taxi.getLongitude() - 0.001);
            
            rideRequestService.updateRideRequest(pendingRide);
            
            return ResponseEntity.ok("Pending ride location updated successfully to be near driver");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fixing pending ride location: " + e.getMessage());
        }
    }
    
    @GetMapping("/fix-null-status")
    public ResponseEntity<String> fixNullStatus() {
        try {
            // Get all rides with NULL status
            List<RideRequest> ridesWithNullStatus = rideRequestService.getAllRidesWithNullStatus();
            
            if (ridesWithNullStatus.isEmpty()) {
                return ResponseEntity.ok("No rides with NULL status found");
            }
            
            // Update each ride to have PENDING status
            for (RideRequest ride : ridesWithNullStatus) {
                ride.setStatus(RideRequest.RideStatus.PENDING);
                rideRequestService.updateRideRequest(ride);
            }
            
            return ResponseEntity.ok("Fixed " + ridesWithNullStatus.size() + " rides with NULL status");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fixing NULL status: " + e.getMessage());
        }
    }
    
    @GetMapping("/fix-status-case")
    public ResponseEntity<String> fixStatusCase() {
        try {
            // Get all rides
            List<RideRequest> allRides = rideRequestService.getAllRides();
            
            int fixedCount = 0;
            
            // Fix any rides with incorrect status case
            for (RideRequest ride : allRides) {
                if (ride.getStatus() != null) {
                    // Ensure status is one of the valid enum values
                    try {
                        RideRequest.RideStatus status = RideRequest.RideStatus.valueOf(ride.getStatus().toString().toUpperCase());
                        if (!status.equals(ride.getStatus())) {
                            ride.setStatus(status);
                            rideRequestService.updateRideRequest(ride);
                            fixedCount++;
                        }
                    } catch (IllegalArgumentException e) {
                        // If status is invalid, set it to PENDING
                        ride.setStatus(RideRequest.RideStatus.PENDING);
                        rideRequestService.updateRideRequest(ride);
                        fixedCount++;
                    }
                }
            }
            
            return ResponseEntity.ok("Fixed status case for " + fixedCount + " rides");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fixing status case: " + e.getMessage());
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("Database fix service is running");
    }
}