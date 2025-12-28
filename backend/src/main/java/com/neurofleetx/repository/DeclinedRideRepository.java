package com.neurofleetx.repository;

import com.neurofleetx.model.DeclinedRide;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeclinedRideRepository extends JpaRepository<DeclinedRide, Long> {
    List<DeclinedRide> findByDriver(User driver);
    Optional<DeclinedRide> findByRideRequestAndDriver(RideRequest rideRequest, User driver);
    void deleteByRideRequestAndDriver(RideRequest rideRequest, User driver);
}