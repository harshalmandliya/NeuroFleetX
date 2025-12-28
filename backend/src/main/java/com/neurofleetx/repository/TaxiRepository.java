package com.neurofleetx.repository;

import com.neurofleetx.model.Taxi;
import com.neurofleetx.model.Taxi.TaxiStatus;
import com.neurofleetx.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaxiRepository extends JpaRepository<Taxi, Long> {
    
    @Query("SELECT t FROM Taxi t WHERE t.batteryLevel > ?1 AND t.status = ?2")
    List<Taxi> findAvailableTaxisWithBattery(int batteryLevel, TaxiStatus status);
    
    List<Taxi> findByDriver(User driver);
}