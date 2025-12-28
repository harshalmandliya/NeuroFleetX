package com.neurofleetx.service;

import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.repository.RideRequestRepository;
import com.neurofleetx.service.DeclinedRideService;
import com.neurofleetx.ml.ETAPredictionService;
import com.neurofleetx.model.RideRequest.RideStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class RideRequestService {
    
    @Autowired
    private RideRequestRepository rideRequestRepository;
    
    @Autowired
    private TaxiService taxiService;
    
    @Autowired
    private DeclinedRideService declinedRideService;
    
    @Autowired
    private ETAPredictionService etaPredictionService;
    
    private Random random = new Random();
    private String[] weatherOptions = {"sunny", "cloudy", "rainy", "snowy"};
    
    public List<RideRequest> getAllRides() {
        return rideRequestRepository.findAll();
    }
    
    private String getTimeOfDay() {
        LocalTime now = LocalTime.now();
        int hour = now.getHour();
        
        if (hour >= 6 && hour < 12) {
            return "morning";
        } else if (hour >= 12 && hour < 17) {
            return "afternoon";
        } else if (hour >= 17 && hour < 21) {
            return "evening";
        } else {
            return "night";
        }
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }
    
    public Optional<RideRequest> getRideRequestById(Long id) {
        return rideRequestRepository.findById(id);
    }
    
    public List<RideRequest> getUnassignedRides() {
        return rideRequestRepository.findByTaxiIsNullAndStatus(RideRequest.RideStatus.PENDING);
    }
    
    public List<RideRequest> getUnassignedRidesForDriver(User driver) {
        return rideRequestRepository.findUnassignedRidesNotDeclinedByDriver(RideRequest.RideStatus.PENDING, driver);
    }
    
    public List<RideRequest> getAllRidesWithNullStatus() {
        return rideRequestRepository.findByStatusIsNull();
    }
    
    public RideRequest saveRideRequest(RideRequest rideRequest) {
        // Generate random values for traffic index (0.0 to 1.0) and weather if not provided or are default values
        if (rideRequest.getTrafficIndex() <= 0.0) {
            // Generate traffic index based on time of day
            double traffic;
            switch (getTimeOfDay()) {
                case "morning", "evening" -> traffic = 0.6 + random.nextDouble() * 0.3;
                case "afternoon" -> traffic = 0.3 + random.nextDouble() * 0.3;
                default -> traffic = 0.2 + random.nextDouble() * 0.2;
            }
            rideRequest.setTrafficIndex(Math.round(traffic * 10.0) / 10.0);
        }
        
        if (rideRequest.getWeather() == null || rideRequest.getWeather().isEmpty()) {
            // Select a random weather condition
            rideRequest.setWeather(weatherOptions[random.nextInt(weatherOptions.length)]);
        }
        
        // Set time of day if not already set
        if (rideRequest.getTimeOfDay() == null || rideRequest.getTimeOfDay().isEmpty()) {
            rideRequest.setTimeOfDay(getTimeOfDay());
        }
        
        // Set default status if not set
        if (rideRequest.getStatus() == null) {
            rideRequest.setStatus(RideStatus.PENDING);
        }
        
        // Predict ETA if not provided
        if (rideRequest.getEta() <= 0.0) {
            try {
                double predictedETA = etaPredictionService.predictETA(
                    rideRequest.getOriginLat(),
                    rideRequest.getOriginLng(),
                    rideRequest.getDestLat(),
                    rideRequest.getDestLng(),
                    rideRequest.getTrafficIndex(),
                    rideRequest.getWeather(),
                    getTimeOfDay()
                );
                rideRequest.setEta(Math.max(1.0, predictedETA)); // Ensure minimum ETA of 1 minute
            } catch (Exception e) {
                // Fallback to a default ETA if prediction fails
                rideRequest.setEta(15.0); // Default ETA of 15 minutes
            }
        }
        
        // Calculate estimated earnings if not set
        if (rideRequest.getEarnings() <= 0.0) {
            // Base fare + (ETA * rate per minute)
            // Using $2.50 base fare + $1.25 per minute as an example
            double baseFare = 2.50;
            double ratePerMinute = 1.25;
            double estimatedEarnings = baseFare + (rideRequest.getEta() * ratePerMinute);
            rideRequest.setEarnings(Math.round(estimatedEarnings * 100.0) / 100.0); // Round to 2 decimal places
        }
        
        return rideRequestRepository.save(rideRequest);
    }
    
    public RideRequest updateRideRequest(RideRequest rideRequest) {
        return rideRequestRepository.save(rideRequest);
    }
    
    public void deleteRideRequest(Long id) {
        rideRequestRepository.deleteById(id);
    }
    
    public List<RideRequest> getRidesByUser(User user) {
        return rideRequestRepository.findByUser(user);
    }
    
    public List<RideRequest> getRidesByDriver(User driver) {
        // Get all taxis belonging to the driver
        List<Taxi> driverTaxis = taxiService.getTaxisByDriver(driver);
        
        // Collect all rides for these taxis
        List<RideRequest> driverRides = new ArrayList<>();
        for (Taxi taxi : driverTaxis) {
            List<RideRequest> ridesForTaxi = rideRequestRepository.findByTaxi(taxi);
            driverRides.addAll(ridesForTaxi);
        }
        
        return driverRides;
    }
    
    public RideRequest driverAcceptRide(Long rideRequestId, User driver) throws Exception {
        // Get the ride request
        RideRequest rideRequest = rideRequestRepository.findById(rideRequestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found"));
        
        // Check if ride is already assigned
        if (rideRequest.getTaxi() != null) {
            throw new RuntimeException("Ride already assigned to another driver");
        }
        
        // Get available taxis for this driver
        List<Taxi> driverTaxis = taxiService.getTaxisByDriver(driver);
        if (driverTaxis.isEmpty()) {
            throw new RuntimeException("Driver has no taxis registered");
        }
        
        // Use the first available taxi
        Taxi taxi = driverTaxis.get(0);
        
        // Check if taxi is available
        if (taxi.getStatus() != Taxi.TaxiStatus.AVAILABLE) {
            throw new RuntimeException("Taxi is not available");
        }
        
        // Update taxi status to BUSY
        taxi.setStatus(Taxi.TaxiStatus.BUSY);
        taxiService.updateTaxi(taxi);
        
        // Assign taxi to ride
        rideRequest.setTaxi(taxi);
        
        // Predict ETA using the ETA prediction service
        try {
            double predictedETA = etaPredictionService.predictETA(
                rideRequest.getOriginLat(),
                rideRequest.getOriginLng(),
                rideRequest.getDestLat(),
                rideRequest.getDestLng(),
                rideRequest.getTrafficIndex(),
                rideRequest.getWeather(),
                rideRequest.getTimeOfDay()
            );
            rideRequest.setEta(Math.max(1.0, predictedETA)); // Ensure minimum ETA of 1 minute
        } catch (Exception e) {
            // Fallback to a default ETA if prediction fails
            rideRequest.setEta(15.0); // Default ETA of 15 minutes
        }
        
        rideRequest.setStatus(RideRequest.RideStatus.ASSIGNED);
        
        // Remove any declined record for this ride and driver
        declinedRideService.removeDeclinedRide(rideRequest, driver);
        
        return rideRequestRepository.save(rideRequest);
    }
    
    public RideRequest startRide(Long rideRequestId) throws Exception {
        // Get the ride request
        RideRequest rideRequest = rideRequestRepository.findById(rideRequestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found"));
        
        // Check if ride is assigned (convert to string for comparison)
        String currentStatus = rideRequest.getStatus() != null ? rideRequest.getStatus().toString() : "";
        if (!"ASSIGNED".equals(currentStatus)) {
            throw new RuntimeException("Ride is not assigned. Current status: " + currentStatus);
        }
        
        // Update ride status to in progress
        rideRequest.setStatus(RideRequest.RideStatus.IN_PROGRESS);
        
        return rideRequestRepository.save(rideRequest);
    }
    
    public RideRequest completeRide(Long rideRequestId) throws Exception {
        // Get the ride request
        RideRequest rideRequest = rideRequestRepository.findById(rideRequestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found"));
        
        // Check if ride is in progress (convert to string for comparison)
        String currentStatus = rideRequest.getStatus() != null ? rideRequest.getStatus().toString() : "";
        if (!"IN_PROGRESS".equals(currentStatus)) {
            throw new RuntimeException("Ride is not in progress. Current status: " + currentStatus);
        }
        
        // Calculate earnings based on ride details instead of random values
        if (rideRequest.getEarnings() <= 0.0) {
            // Calculate fare based on distance, time, and traffic
            double distance = calculateDistance(
                rideRequest.getOriginLat(), 
                rideRequest.getOriginLng(), 
                rideRequest.getDestLat(), 
                rideRequest.getDestLng()
            );
            double baseFare = 2.50;
            double distanceFare = distance * 1.2;
            double timeFare = rideRequest.getEta() * 0.8;
            double trafficSurge = 1 + rideRequest.getTrafficIndex();
            
            double earnings = (baseFare + distanceFare + timeFare) * trafficSurge;
            rideRequest.setEarnings(Math.round(earnings * 100.0) / 100.0); // Round to 2 decimal places
        }
        
        // Update ride status to completed
        rideRequest.setStatus(RideRequest.RideStatus.COMPLETED);
        
        // Get the taxi and update its status to AVAILABLE
        Taxi taxi = rideRequest.getTaxi();
        if (taxi != null) {
            taxi.setStatus(Taxi.TaxiStatus.AVAILABLE);
            taxiService.updateTaxi(taxi);
        }
        
        return rideRequestRepository.save(rideRequest);
    }
    
    public void driverDeclineRide(Long rideRequestId, User driver) throws Exception {
        // Get the ride request
        RideRequest rideRequest = rideRequestRepository.findById(rideRequestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found"));
        
        // Track that this driver has declined this ride
        declinedRideService.saveDeclinedRide(rideRequest, driver);
    }
    
    public double getTotalEarningsForDriver(User driver) {
        List<Taxi> driverTaxis = taxiService.getTaxisByDriver(driver);
        double totalEarnings = 0.0;
        
        for (Taxi taxi : driverTaxis) {
            List<RideRequest> completedRides = rideRequestRepository.findByTaxiAndStatus(taxi, RideRequest.RideStatus.COMPLETED);
            for (RideRequest ride : completedRides) {
                totalEarnings += ride.getEarnings();
            }
        }
        
        return Math.round(totalEarnings * 100.0) / 100.0; // Round to 2 decimal places
    }
    
    public int getCompletedRidesCountForDriver(User driver) {
        List<Taxi> driverTaxis = taxiService.getTaxisByDriver(driver);
        int totalCount = 0;
        
        for (Taxi taxi : driverTaxis) {
            List<RideRequest> completedRides = rideRequestRepository.findByTaxiAndStatus(taxi, RideRequest.RideStatus.COMPLETED);
            totalCount += completedRides.size();
        }
        
        return totalCount;
    }
}