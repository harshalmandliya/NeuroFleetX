package com.neurofleetx.service;

import com.neurofleetx.model.DriverProfile;
import com.neurofleetx.model.User;
import com.neurofleetx.repository.DriverProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class DriverService {

    @Autowired
    private DriverProfileRepository driverProfileRepository;

    public DriverProfile getDriverProfileByUser(User user) {
        return driverProfileRepository.findByUser(user).orElse(null);
    }

    public DriverProfile saveDriverProfile(DriverProfile driverProfile) {
        return driverProfileRepository.save(driverProfile);
    }

    public void deleteDriverProfile(Long id) {
        driverProfileRepository.deleteById(id);
    }
}