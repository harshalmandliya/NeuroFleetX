package com.neurofleetx.controller;

import com.neurofleetx.dto.RideRequestDTO;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import com.neurofleetx.service.MapperService;
import com.neurofleetx.service.RideRequestService;
import com.neurofleetx.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rides")
public class RideRequestController {
    
    @Autowired
    private RideRequestService rideRequestService;
    
    @Autowired
    private MapperService mapperService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<RideRequestDTO>> getAllRideRequests() {
        List<RideRequest> rideRequests = rideRequestService.getAllRides();
        List<RideRequestDTO> rideRequestDTOs = rideRequests.stream()
                .map(mapperService::toRideRequestDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rideRequestDTOs);
    }
    
    @GetMapping("/unassigned")
    public ResponseEntity<List<RideRequestDTO>> getUnassignedRideRequests() {
        List<RideRequest> rideRequests = rideRequestService.getUnassignedRides();
        List<RideRequestDTO> rideRequestDTOs = rideRequests.stream()
                .map(mapperService::toRideRequestDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rideRequestDTOs);
    }
    
    @GetMapping("/unassigned-for-driver")
    public ResponseEntity<List<RideRequestDTO>> getUnassignedRideRequestsForDriver(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        List<RideRequest> rideRequests = rideRequestService.getUnassignedRidesForDriver(user);
        List<RideRequestDTO> rideRequestDTOs = rideRequests.stream()
                .map(mapperService::toRideRequestDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rideRequestDTOs);
    }
    
    @PostMapping
    public ResponseEntity<RideRequestDTO> createRideRequest(@RequestBody RideRequestDTO rideRequestDTO) {
        RideRequest rideRequest = mapperService.toRideRequest(rideRequestDTO);
        RideRequest savedRideRequest = rideRequestService.saveRideRequest(rideRequest);
        RideRequestDTO savedRideRequestDTO = mapperService.toRideRequestDTO(savedRideRequest);
        return ResponseEntity.ok(savedRideRequestDTO);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RideRequestDTO> updateRideRequest(@PathVariable Long id, @RequestBody RideRequestDTO rideRequestDTO) {
        if (!rideRequestService.getRideRequestById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        rideRequestDTO.setId(id);
        RideRequest rideRequest = mapperService.toRideRequest(rideRequestDTO);
        RideRequest updatedRideRequest = rideRequestService.updateRideRequest(rideRequest);
        RideRequestDTO updatedRideRequestDTO = mapperService.toRideRequestDTO(updatedRideRequest);
        return ResponseEntity.ok(updatedRideRequestDTO);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRideRequest(@PathVariable Long id) {
        if (!rideRequestService.getRideRequestById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        rideRequestService.deleteRideRequest(id);
        return ResponseEntity.noContent().build();
    }
}