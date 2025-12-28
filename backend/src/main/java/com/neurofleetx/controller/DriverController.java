package com.neurofleetx.controller;

import com.neurofleetx.dto.DriverRideActionDTO;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.service.RideRequestService;
import com.neurofleetx.service.UserService;
import com.neurofleetx.service.TaxiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/driver")
public class DriverController {
    
    private static final Logger logger = LoggerFactory.getLogger(DriverController.class);
    
    @Autowired
    private RideRequestService rideRequestService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TaxiService taxiService;
    
    // Inner class for driver statistics
    public static class DriverStatistics {
        private double totalEarnings;
        private int completedRides;
        
        public DriverStatistics(double totalEarnings, int completedRides) {
            this.totalEarnings = totalEarnings;
            this.completedRides = completedRides;
        }
        
        // Getters and setters
        public double getTotalEarnings() { return totalEarnings; }
        public void setTotalEarnings(double totalEarnings) { this.totalEarnings = totalEarnings; }
        public int getCompletedRides() { return completedRides; }
        public void setCompletedRides(int completedRides) { this.completedRides = completedRides; }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<User> getDriverProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/taxis")
    public ResponseEntity<List<Taxi>> getDriverTaxis(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        List<Taxi> taxis = taxiService.getTaxisByDriver(user);
        return ResponseEntity.ok(taxis);
    }
    
    @PostMapping("/taxis")
    public ResponseEntity<Taxi> createDriverTaxi(@RequestBody Taxi taxi, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        taxi.setDriver(user);
        Taxi savedTaxi = taxiService.saveTaxi(taxi);
        return ResponseEntity.ok(savedTaxi);
    }
    
    @PutMapping("/taxis/{id}")
    public ResponseEntity<Taxi> updateDriverTaxi(@PathVariable Long id, @RequestBody Taxi taxi, Authentication authentication) {
        // Verify taxi belongs to driver
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        Taxi existingTaxi = taxiService.getTaxiById(id).orElse(null);
        
        if (existingTaxi == null || !existingTaxi.getDriver().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        
        taxi.setId(id);
        taxi.setDriver(user); // Ensure driver is preserved
        Taxi updatedTaxi = taxiService.updateTaxi(taxi);
        return ResponseEntity.ok(updatedTaxi);
    }
    
    @GetMapping("/rides")
    public ResponseEntity<List<RideRequest>> getDriverRides(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        List<RideRequest> rides = rideRequestService.getRidesByDriver(user);
        return ResponseEntity.ok(rides);
    }
    
    @PostMapping("/rides/action")
    public ResponseEntity<RideRequest> driverRideAction(@RequestBody DriverRideActionDTO actionDTO, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        
        try {
            if ("ACCEPT".equals(actionDTO.getAction())) {
                RideRequest acceptedRide = rideRequestService.driverAcceptRide(actionDTO.getRideRequestId(), user);
                return ResponseEntity.ok(acceptedRide);
            } else if ("DECLINE".equals(actionDTO.getAction())) {
                rideRequestService.driverDeclineRide(actionDTO.getRideRequestId(), user);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            logger.error("Error processing driver ride action: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/rides/{id}/start")
    public ResponseEntity<RideRequest> startRide(@PathVariable Long id, Authentication authentication) {
        try {
            RideRequest startedRide = rideRequestService.startRide(id);
            return ResponseEntity.ok(startedRide);
        } catch (Exception e) {
            logger.error("Error starting ride: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/rides/{id}/complete")
    public ResponseEntity<RideRequest> completeRide(@PathVariable Long id, Authentication authentication) {
        try {
            RideRequest completedRide = rideRequestService.completeRide(id);
            return ResponseEntity.ok(completedRide);
        } catch (Exception e) {
            logger.error("Error completing ride: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/earnings")
    public ResponseEntity<Double> getDriverEarnings(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            double totalEarnings = rideRequestService.getTotalEarningsForDriver(user);
            return ResponseEntity.ok(totalEarnings);
        } catch (Exception e) {
            logger.error("Error getting driver earnings: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<DriverStatistics> getDriverStatistics(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            double totalEarnings = rideRequestService.getTotalEarningsForDriver(user);
            int completedRides = rideRequestService.getCompletedRidesCountForDriver(user);
            
            DriverStatistics stats = new DriverStatistics(totalEarnings, completedRides);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting driver statistics: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
}