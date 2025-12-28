package com.neurofleetx.repository;

import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.model.RideRequest.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    List<RideRequest> findByUser(User user);
    List<RideRequest> findByTaxi(Taxi taxi);
    List<RideRequest> findByTaxiIsNull();
    List<RideRequest> findByTaxiIsNullAndStatus(RideStatus status);
    List<RideRequest> findByTaxiAndStatus(Taxi taxi, RideStatus status);
    List<RideRequest> findByStatusIsNull();
    
    @Query("SELECT rr FROM RideRequest rr WHERE rr.taxi IS NULL AND rr.status = :status AND " +
           "NOT EXISTS (SELECT 1 FROM DeclinedRide dr WHERE dr.rideRequest = rr AND dr.driver = :driver)")
    List<RideRequest> findUnassignedRidesNotDeclinedByDriver(@Param("status") RideStatus status, @Param("driver") User driver);
    
    void deleteByUser_Id(Long userId);
}