package com.neurofleetx.service;

import com.neurofleetx.model.DeclinedRide;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import com.neurofleetx.repository.DeclinedRideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DeclinedRideService {
    
    @Autowired
    private DeclinedRideRepository declinedRideRepository;
    
    public DeclinedRide saveDeclinedRide(RideRequest rideRequest, User driver) {
        DeclinedRide declinedRide = new DeclinedRide();
        declinedRide.setRideRequest(rideRequest);
        declinedRide.setDriver(driver);
        return declinedRideRepository.save(declinedRide);
    }
    
    public List<DeclinedRide> getDeclinedRidesByDriver(User driver) {
        return declinedRideRepository.findByDriver(driver);
    }
    
    public Optional<DeclinedRide> getDeclinedRideByRideAndDriver(RideRequest rideRequest, User driver) {
        return declinedRideRepository.findByRideRequestAndDriver(rideRequest, driver);
    }
    
    public boolean hasDriverDeclinedRide(RideRequest rideRequest, User driver) {
        return declinedRideRepository.findByRideRequestAndDriver(rideRequest, driver).isPresent();
    }
    
    public void removeDeclinedRide(RideRequest rideRequest, User driver) {
        declinedRideRepository.deleteByRideRequestAndDriver(rideRequest, driver);
    }
}