package com.neurofleetx.service;

import com.neurofleetx.model.Taxi;
import com.neurofleetx.model.User;
import com.neurofleetx.repository.TaxiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TaxiService {
    
    @Autowired
    private TaxiRepository taxiRepository;
    
    public List<Taxi> getAllTaxis() {
        return taxiRepository.findAll();
    }
    
    public Optional<Taxi> getTaxiById(Long id) {
        return taxiRepository.findById(id);
    }
    
    public Taxi saveTaxi(Taxi taxi) {
        return taxiRepository.save(taxi);
    }
    
    public Taxi updateTaxi(Taxi taxi) {
        return taxiRepository.save(taxi);
    }
    
    public void deleteTaxi(Long id) {
        taxiRepository.deleteById(id);
    }
    
    public List<Taxi> getAvailableTaxis() {
        return taxiRepository.findAvailableTaxisWithBattery(20, Taxi.TaxiStatus.AVAILABLE);
    }
    
    public List<Taxi> getTaxisByDriver(User driver) {
        return taxiRepository.findByDriver(driver);
    }
}