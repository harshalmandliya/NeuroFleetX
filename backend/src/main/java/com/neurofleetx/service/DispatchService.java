package com.neurofleetx.service;

import com.neurofleetx.dto.DispatchResponseDTO;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.ml.ETAPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import java.time.LocalTime;
import java.util.List;

@Service
public class DispatchService {
    
    @Autowired
    private TaxiService taxiService;
    
    @Autowired
    @Lazy
    private RideRequestService rideRequestService;
    
    @Autowired
    private ETAPredictionService etaPredictionService;
    
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
        
        public DispatchResponseDTO dispatchTaxi(Long rideRequestId) {
        // Get the ride request
        RideRequest rideRequest = rideRequestService.getRideRequestById(rideRequestId)
                .orElseThrow(() -> new RuntimeException("Ride request not found"));
        
        // Get available taxis
        List<Taxi> availableTaxis = taxiService.getAvailableTaxis();
        
        if (availableTaxis.isEmpty()) {
            throw new RuntimeException("No available taxis");
        }
        
        // Find the best taxi
        Taxi bestTaxi = null;
        double bestScore = Double.MAX_VALUE;
        double predictedETA = 0;
        
        for (Taxi taxi : availableTaxis) {
            // Calculate distance using Haversine formula
            double distance = calculateDistance(
                    rideRequest.getOriginLat(), rideRequest.getOriginLng(),
                    taxi.getLatitude(), taxi.getLongitude());
            
            // Predict ETA
            double eta = etaPredictionService.predictETA(
                    rideRequest.getOriginLat(), rideRequest.getOriginLng(),
                    rideRequest.getDestLat(), rideRequest.getDestLng(),
                    rideRequest.getTrafficIndex(), rideRequest.getWeather(), rideRequest.getTimeOfDay());
            
            // Calculate score using the required formula:
            // score = distanceWeight * distance +
            //         etaWeight * predictedEta +
            //         batteryWeight * (1 - battery%) +
            //         loadWeight * activeRideCount
            
            double distanceWeight = 0.3;
            double etaWeight = 0.4;
            double batteryWeight = 0.2;
            double loadWeight = 0.1;
            
            // For simplicity, we're assuming activeRideCount is 0 for all taxis
            // In a real implementation, this would need to be calculated
            int activeRideCount = 0;
            
            double score = distanceWeight * distance +
                          etaWeight * eta +
                          batteryWeight * (1 - taxi.getBatteryLevel() / 100.0) +
                          loadWeight * activeRideCount;
            
            if (score < bestScore) {
                bestScore = score;
                bestTaxi = taxi;
                predictedETA = eta;
            }
        }
        
        if (bestTaxi == null) {
            throw new RuntimeException("Could not find suitable taxi");
        }
        
        // Update taxi status to BUSY
        bestTaxi.setStatus(Taxi.TaxiStatus.BUSY);
        taxiService.updateTaxi(bestTaxi);
        
        // Assign taxi to ride
        rideRequest.setTaxi(bestTaxi);
        rideRequest.setEta(predictedETA);
        rideRequest.setStatus(RideRequest.RideStatus.ASSIGNED);
        rideRequestService.updateRideRequest(rideRequest);
        
        // Return dispatch result
        DispatchResponseDTO response = new DispatchResponseDTO();
        response.setTaxiId(bestTaxi.getId());
        response.setEta(predictedETA);
        
        return response;
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
}