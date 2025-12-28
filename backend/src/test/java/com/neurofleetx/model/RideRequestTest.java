package com.neurofleetx.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RideRequestTest {

    @Test
    void testRideRequestCreation() {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setOriginLat(40.7128);
        rideRequest.setOriginLng(-74.0060);
        rideRequest.setDestLat(40.7589);
        rideRequest.setDestLng(-73.9851);
        rideRequest.setTrafficIndex(0.7);
        rideRequest.setWeather("sunny");
        Taxi taxi = new Taxi();
        taxi.setId(1L);
        rideRequest.setTaxi(taxi);
        rideRequest.setEta(12.5);
        rideRequest.setStatus(RideRequest.RideStatus.PENDING);
        
        assertEquals(40.7128, rideRequest.getOriginLat());
        assertEquals(-74.0060, rideRequest.getOriginLng());
        assertEquals(40.7589, rideRequest.getDestLat());
        assertEquals(-73.9851, rideRequest.getDestLng());
        assertEquals(0.7, rideRequest.getTrafficIndex());
        assertEquals("sunny", rideRequest.getWeather());
        assertEquals(1L, rideRequest.getTaxi().getId());
        assertEquals(12.5, rideRequest.getEta());
        assertEquals(RideRequest.RideStatus.PENDING, rideRequest.getStatus());
    }
}