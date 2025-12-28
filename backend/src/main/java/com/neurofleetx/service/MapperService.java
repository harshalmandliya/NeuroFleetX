package com.neurofleetx.service;

import com.neurofleetx.dto.TaxiDTO;
import com.neurofleetx.dto.RideRequestDTO;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    
    public TaxiDTO toTaxiDTO(Taxi taxi) {
        if (taxi == null) return null;
        
        TaxiDTO dto = new TaxiDTO();
        dto.setId(taxi.getId());
        dto.setName(taxi.getName());
        dto.setLatitude(taxi.getLatitude());
        dto.setLongitude(taxi.getLongitude());
        dto.setBatteryLevel(taxi.getBatteryLevel());
        dto.setStatus(taxi.getStatus() != null ? taxi.getStatus().name() : null);
        
        // Include driver information if present
        if (taxi.getDriver() != null) {
            User driver = taxi.getDriver();
            dto.setDriverId(driver.getId());
            dto.setDriverFirstName(driver.getFirstName());
            dto.setDriverLastName(driver.getLastName());
            dto.setDriverEmail(driver.getEmail());
        }
        
        return dto;
    }
    
    public Taxi toTaxi(TaxiDTO dto) {
        if (dto == null) return null;
        
        Taxi taxi = new Taxi();
        taxi.setId(dto.getId());
        taxi.setName(dto.getName());
        taxi.setLatitude(dto.getLatitude());
        taxi.setLongitude(dto.getLongitude());
        taxi.setBatteryLevel(dto.getBatteryLevel());
        taxi.setStatus(dto.getStatus() != null ? Taxi.TaxiStatus.valueOf(dto.getStatus()) : null);
        return taxi;
    }
    
    public RideRequestDTO toRideRequestDTO(RideRequest rideRequest) {
        if (rideRequest == null) return null;
        
        RideRequestDTO dto = new RideRequestDTO();
        dto.setId(rideRequest.getId());
        dto.setOriginLat(rideRequest.getOriginLat());
        dto.setOriginLng(rideRequest.getOriginLng());
        dto.setDestLat(rideRequest.getDestLat());
        dto.setDestLng(rideRequest.getDestLng());
        dto.setTrafficIndex(rideRequest.getTrafficIndex());
        dto.setWeather(rideRequest.getWeather());
        dto.setAssignedTaxiId(rideRequest.getTaxi() != null ? rideRequest.getTaxi().getId() : null);
        dto.setEta(rideRequest.getEta());
        dto.setEarnings(rideRequest.getEarnings());
        dto.setStatus(rideRequest.getStatus() != null ? rideRequest.getStatus().name() : null);
        dto.setTimestamp(rideRequest.getTimestamp());
        return dto;
    }
    
    public RideRequest toRideRequest(RideRequestDTO dto) {
        if (dto == null) return null;
        
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(dto.getId());
        rideRequest.setOriginLat(dto.getOriginLat());
        rideRequest.setOriginLng(dto.getOriginLng());
        rideRequest.setDestLat(dto.getDestLat());
        rideRequest.setDestLng(dto.getDestLng());
        rideRequest.setTrafficIndex(dto.getTrafficIndex());
        rideRequest.setWeather(dto.getWeather());
        // Note: taxi relationship should be set separately when needed
        rideRequest.setEta(dto.getEta());
        rideRequest.setEarnings(dto.getEarnings());
        rideRequest.setStatus(dto.getStatus() != null ? RideRequest.RideStatus.valueOf(dto.getStatus()) : null);
        rideRequest.setTimestamp(dto.getTimestamp());
        return rideRequest;
    }
}