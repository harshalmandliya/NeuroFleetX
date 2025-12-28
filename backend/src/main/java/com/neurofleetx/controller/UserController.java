package com.neurofleetx.controller;

import com.neurofleetx.dto.RideRequestDTO;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import com.neurofleetx.service.MapperService;
import com.neurofleetx.service.RideRequestService;
import com.neurofleetx.service.UserService;
import com.neurofleetx.service.DispatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.Statement;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private RideRequestService rideRequestService;

    @Autowired
    private UserService userService;

    @Autowired
    private MapperService mapperService;
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    @Lazy
    private DispatchService dispatchService;

    // Allowed image file extensions
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif");

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            // Log authentication details for debugging
            logger.info("Upload profile picture request received");
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request to upload profile picture");
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            String email = authentication.getName();
            logger.info("Authenticated user: {}", email);
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            
            // Get file extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.lastIndexOf('.') == -1) {
                return ResponseEntity.badRequest().body("Invalid file format");
            }
            
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
            
            // Check if file extension is allowed
            if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                return ResponseEntity.badRequest().body("File type not allowed. Allowed types: " + ALLOWED_EXTENSIONS);
            }
            
            // Get user
            User user = userService.getUserByEmail(email);
            if (user == null) {
                logger.warn("User not found: {}", email);
                return ResponseEntity.status(404).body("User not found");
            }
            
            // Generate unique filename
            String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
            
            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/profile-pictures/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                if (!created) {
                    logger.error("Failed to create upload directory: {}", uploadDir);
                    return ResponseEntity.status(500).body("Failed to create upload directory");
                }
            }
            
            // Save file to disk
            Path filePath = Paths.get(uploadDir, uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update user profile picture URL
            String profilePictureUrl = "/uploads/profile-pictures/" + uniqueFileName;
            user.setProfilePictureUrl(profilePictureUrl);
            User updatedUser = userService.saveUser(user);
            
            // Return absolute URL
            String absoluteProfilePictureUrl = "http://localhost:8080" + profilePictureUrl;
            updatedUser.setProfilePictureUrl(absoluteProfilePictureUrl);
            
            logger.info("Profile picture uploaded successfully for user: {}", email);
            logger.info("Profile picture URL: {}", profilePictureUrl);
            logger.info("Absolute profile picture URL: {}", absoluteProfilePictureUrl);
            logger.info("Updated user profile picture URL: {}", updatedUser.getProfilePictureUrl());
            return ResponseEntity.ok(updatedUser);
        } catch (IOException e) {
            logger.error("Error uploading profile picture for user", e);
            return ResponseEntity.status(500).body("Failed to upload profile picture");
        } catch (Exception e) {
            logger.error("Unexpected error uploading profile picture", e);
            return ResponseEntity.status(500).body("An unexpected error occurred");
        }
    }

    @GetMapping("/rides")
    public ResponseEntity<List<RideRequestDTO>> getUserRides(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        List<RideRequest> rideRequests = rideRequestService.getRidesByUser(user);
        List<RideRequestDTO> rideRequestDTOs = rideRequests.stream()
                .map(mapperService::toRideRequestDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rideRequestDTOs);
    }

    @PostMapping("/rides")
    public ResponseEntity<RideRequestDTO> createUserRide(@RequestBody RideRequestDTO rideRequestDTO, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        RideRequest rideRequest = mapperService.toRideRequest(rideRequestDTO);
        rideRequest.setUser(user);
        RideRequest savedRideRequest = rideRequestService.saveRideRequest(rideRequest);
        
        // Remove automatic dispatch - rides will be manually assigned by drivers
        /*
        if (savedRideRequest.getTaxi() == null) {
            try {
                // Try to automatically dispatch the ride
                dispatchService.dispatchTaxi(savedRideRequest.getId());
            } catch (Exception e) {
                // If dispatch fails, the ride remains unassigned
                logger.info("Automatic dispatch failed for ride {}: {}", savedRideRequest.getId(), e.getMessage());
            }
        }
        */
        
        RideRequestDTO savedRideRequestDTO = mapperService.toRideRequestDTO(savedRideRequest);
        return ResponseEntity.ok(savedRideRequestDTO);
    }
    
    // Temporary endpoint to add the earnings column - no authentication required
    @GetMapping("/fix-database")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> fixDatabase() {
        try {
            Connection conn = dataSource.getConnection();
            Statement stmt = conn.createStatement();
            
            // Check if the earnings column exists
            try {
                stmt.execute("ALTER TABLE ride_request ADD COLUMN earnings DOUBLE PRECISION DEFAULT 0.0");
                return ResponseEntity.ok("Database fixed successfully - earnings column added");
            } catch (Exception e) {
                // Column might already exist
                return ResponseEntity.ok("Database already has the earnings column or error: " + e.getMessage());
            } finally {
                stmt.close();
                conn.close();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fixing database: " + e.getMessage());
        }
    }
}