package com.neurofleetx.controller;

import com.neurofleetx.dto.RideRequestDTO;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.service.MapperService;
import com.neurofleetx.service.RideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RideRequestController {
    
    @Autowired
    private RideRequestService rideRequestService;
    
    @Autowired
    private MapperService mapperService;
    
    @GetMapping
    public ResponseEntity<List<RideRequestDTO>> getAllRideRequests() {
        List<RideRequest> rideRequests = rideRequestService.getAllRideRequests();
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