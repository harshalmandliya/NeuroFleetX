package com.neurofleetx.controller;

import com.neurofleetx.dto.DispatchRequestDTO;
import com.neurofleetx.dto.DispatchResponseDTO;
import com.neurofleetx.model.ModelMetrics;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.model.User;
import com.neurofleetx.service.DispatchService;
import com.neurofleetx.service.ModelMetricsService;
import com.neurofleetx.service.RideRequestService;
import com.neurofleetx.service.TaxiService;
import com.neurofleetx.service.UserService;
import com.neurofleetx.ml.ETAPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private DispatchService dispatchService;

    @Autowired
    private UserService userService;

    @Autowired
    private TaxiService taxiService;

    @Autowired
    private RideRequestService rideRequestService;

    @Autowired
    private ModelMetricsService modelMetricsService;

    @Autowired
    private ETAPredictionService etaPredictionService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/dispatch")
    public ResponseEntity<DispatchResponseDTO> manualDispatch(@RequestBody DispatchRequestDTO dispatchRequest) {
        try {
            DispatchResponseDTO response = dispatchService.dispatchTaxi(dispatchRequest.getRideRequestId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/taxis")
    public ResponseEntity<List<Taxi>> getAllTaxis() {
        List<Taxi> taxis = taxiService.getAllTaxis();
        return ResponseEntity.ok(taxis);
    }

    @GetMapping("/rides")
    public ResponseEntity<List<RideRequest>> getAllRides() {
        List<RideRequest> rides = rideRequestService.getAllRides();
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/metrics")
    public ResponseEntity<List<ModelMetrics>> getModelMetrics() {
        List<ModelMetrics> metrics = modelMetricsService.getAllMetrics();
        return ResponseEntity.ok(metrics);
    }

    @PostMapping("/model/train")
    public ResponseEntity<String> trainModel(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Received model training request with file: {}", file.getOriginalFilename());
            
            // Check if file is empty
            if (file.isEmpty()) {
                logger.warn("Empty file provided for model training");
                return ResponseEntity.badRequest().body("File is empty");
            }
            
            // Save the uploaded file temporarily
            Path tempFile = Files.createTempFile("training-data-", ".csv");
            file.transferTo(tempFile);
            
            logger.info("File saved to temporary location: {}", tempFile.toString());
            
            // Train the model
            etaPredictionService.trainModel(tempFile.toString());
            
            // Clean up temporary file
            Files.delete(tempFile);
            
            logger.info("Model trained successfully");
            return ResponseEntity.ok("Model trained successfully");
        } catch (Exception e) {
            logger.error("Failed to train model", e);
            return ResponseEntity.status(500).body("Failed to train model: " + e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userData) {
        try {
            User updatedUser = userService.updateUser(id, userData);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/taxis/{id}")
    public ResponseEntity<Void> deleteTaxi(@PathVariable Long id) {
        taxiService.deleteTaxi(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/users")
    public ResponseEntity<User> createAdminUser(@RequestBody User userData) {
        try {
            User.Role userRole = User.Role.ROLE_ADMIN;
            userData.setRoles(Set.of(userRole));
            
            // Hash the password if provided
            if (userData.getPassword() != null && !userData.getPassword().isEmpty()) {
                userData.setPassword(passwordEncoder.encode(userData.getPassword()));
            }
            
            User savedUser = userService.saveUser(userData);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}