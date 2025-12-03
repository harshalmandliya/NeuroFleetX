package com.neurofleetx.service;

import com.neurofleetx.model.RideRequest;
import com.neurofleetx.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RideRequestService {
    
    @Autowired
private RideRequestRepository rideRequestRepository;
    
    public List<RideRequest> getAllRideRequests() {
        return rideRequestRepository.findAll();
    }
    
    public Optional<RideRequest> getRideRequestById(Long id) {
        return rideRequestRepository.findById(id);
    }
    
    public RideRequest saveRideRequest(RideRequest rideRequest) {
        return rideRequestRepository.save(rideRequest);
    }
    
    public RideRequest updateRideRequest(RideRequest rideRequest) {
        return rideRequestRepository.save(rideRequest);
    }
    
    public void deleteRideRequest(Long id) {
        rideRequestRepository.deleteById(id);
    }
}