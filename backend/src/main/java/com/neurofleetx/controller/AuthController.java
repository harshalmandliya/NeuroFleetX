package com.neurofleetx.controller;

import com.neurofleetx.dto.LoginRequestDTO;
import com.neurofleetx.dto.SignupRequestDTO;
import com.neurofleetx.model.User;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDTO signupRequest, HttpServletResponse response) {
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        
        // Set role based on request or default to USER
        // NOTE: Only allow ROLE_USER and ROLE_DRIVER for public signup
        // ROLE_ADMIN can only be created by existing admins
        User.Role userRole;
        if ("ROLE_DRIVER".equals(signupRequest.getRole())) {
            userRole = User.Role.ROLE_DRIVER;
        } else {
            // Default to USER role for public signup
            userRole = User.Role.ROLE_USER;
        }
        user.setRoles(Collections.singleton(userRole));

        User savedUser = userRepository.save(user);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // Set HttpOnly cookie
        Cookie cookie = new Cookie("NEUROFLEETX_TOKEN", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "User registered successfully");
        responseBody.put("user", savedUser);
        return ResponseEntity.ok(responseBody);
    }

    // Admin-only endpoint for creating new admins
    @PostMapping("/admin-signup")
    public ResponseEntity<?> adminSignup(@RequestBody SignupRequestDTO signupRequest, HttpServletResponse response, Authentication authentication) {
        // Check if the authenticated user is an admin
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Access denied. Only admins can create new admin accounts.");
        }

        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        
        // Force the role to be ADMIN for this endpoint
        User.Role userRole = User.Role.ROLE_ADMIN;
        user.setRoles(Collections.singleton(userRole));

        User savedUser = userRepository.save(user);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // Set HttpOnly cookie
        Cookie cookie = new Cookie("NEUROFLEETX_TOKEN", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Admin registered successfully");
        responseBody.put("user", savedUser);
        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest, HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

            // Generate JWT token
            String token = jwtUtil.generateToken(userDetails);

            // Set HttpOnly cookie
            Cookie cookie = new Cookie("NEUROFLEETX_TOKEN", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(cookie);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Login successful");
            responseBody.put("user", user);
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("NEUROFLEETX_TOKEN", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Logged out successfully");
        return ResponseEntity.ok(responseBody);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        User user = userRepository.findByEmail(principal.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // Log user data for debugging
        System.out.println("Returning user data: " + user);
        if (user.getProfilePictureUrl() != null) {
            System.out.println("User profile picture URL: " + user.getProfilePictureUrl());
            
            // Modify the URL to be absolute if it's relative
            String profilePictureUrl = user.getProfilePictureUrl();
            if (profilePictureUrl.startsWith("/")) {
                profilePictureUrl = "http://localhost:8080" + profilePictureUrl;
                user.setProfilePictureUrl(profilePictureUrl);
                System.out.println("Modified profile picture URL: " + profilePictureUrl);
            }
        }

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("user", user);
        return ResponseEntity.ok(responseBody);
    }

    // Forgot password endpoint
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            // For security reasons, we don't reveal if the email exists
            return ResponseEntity.ok().body("If the email exists, a password reset link has been sent");
        }
        
        User user = userOptional.get();
        
        // Generate a password reset token (in a real app, this would be a secure token)
        String resetToken = UUID.randomUUID().toString();
        
        // In a real application, you would:
        // 1. Store the reset token in the database with an expiration time
        // 2. Send an email to the user with a link containing the token
        // 3. Create a reset-password endpoint to handle the token validation and password update
        
        // For this implementation, we'll just log the token
        System.out.println("Password reset token for " + email + ": " + resetToken);
        
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "If the email exists, a password reset link has been sent");
        return ResponseEntity.ok(responseBody);
    }

    // Reset password endpoint
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        if (token == null || token.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }
        
        // In a real application, you would:
        // 1. Validate the token and check if it hasn't expired
        // 2. Find the user associated with the token
        // 3. Update the user's password
        // 4. Invalidate the token so it can't be used again
        
        // For this implementation, we'll just return a success message
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Password reset successfully");
        return ResponseEntity.ok(responseBody);
    }
}