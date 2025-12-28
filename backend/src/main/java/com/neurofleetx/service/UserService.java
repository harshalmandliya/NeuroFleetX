package com.neurofleetx.service;

import com.neurofleetx.model.User;
import com.neurofleetx.repository.RideRequestRepository;
import com.neurofleetx.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User updateUser(Long id, User userData) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Update user fields
        existingUser.setEmail(userData.getEmail());
        existingUser.setFirstName(userData.getFirstName());
        existingUser.setLastName(userData.getLastName());
        existingUser.setRoles(userData.getRoles());
        
        // Only update password if provided
        if (userData.getPassword() != null && !userData.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userData.getPassword()));
        }
        
        return userRepository.save(existingUser);
    }

    @Autowired
    private RideRequestRepository rideRequestRepository;
    
    @Transactional
    public void deleteUser(Long userId) {
        rideRequestRepository.deleteByUser_Id(userId);
        userRepository.deleteById(userId);
    }
}