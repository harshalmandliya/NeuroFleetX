package com.neurofleetx.service;

import com.neurofleetx.dto.TaxiDTO;
import com.neurofleetx.dto.RideRequestDTO;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.model.RideRequest;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MapperServiceTest {

    private final MapperService mapperService = new MapperService();

    @Test
    void testToTaxiDTO() {
        Taxi taxi = new Taxi();
        taxi.setId(1L);
        taxi.setName("Test Taxi");
        taxi.setLatitude(40.7128);
        taxi.setLongitude(-74.0060);
        taxi.setBatteryLevel(85);
        taxi.setStatus(Taxi.TaxiStatus.AVAILABLE);

        TaxiDTO taxiDTO = mapperService.toTaxiDTO(taxi);

        assertNotNull(taxiDTO);
        assertEquals(1L, taxiDTO.getId());
        assertEquals("Test Taxi", taxiDTO.getName());
        assertEquals(40.7128, taxiDTO.getLatitude());
        assertEquals(-74.0060, taxiDTO.getLongitude());
        assertEquals(85, taxiDTO.getBatteryLevel());
        assertEquals("AVAILABLE", taxiDTO.getStatus());
    }

    @Test
    void testToTaxi() {
        TaxiDTO taxiDTO = new TaxiDTO();
        taxiDTO.setId(1L);
        taxiDTO.setName("Test Taxi");
        taxiDTO.setLatitude(40.7128);
        taxiDTO.setLongitude(-74.0060);
        taxiDTO.setBatteryLevel(85);
        taxiDTO.setStatus("AVAILABLE");

        Taxi taxi = mapperService.toTaxi(taxiDTO);

        assertNotNull(taxi);
        assertEquals(1L, taxi.getId());
        assertEquals("Test Taxi", taxi.getName());
        assertEquals(40.7128, taxi.getLatitude());
        assertEquals(-74.0060, taxi.getLongitude());
        assertEquals(85, taxi.getBatteryLevel());
        assertEquals(Taxi.TaxiStatus.AVAILABLE, taxi.getStatus());
    }

    @Test
    void testToRideRequestDTO() {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
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

        RideRequestDTO rideRequestDTO = mapperService.toRideRequestDTO(rideRequest);

        assertNotNull(rideRequestDTO);
        assertEquals(1L, rideRequestDTO.getId());
        assertEquals(40.7128, rideRequestDTO.getOriginLat());
        assertEquals(-74.0060, rideRequestDTO.getOriginLng());
        assertEquals(40.7589, rideRequestDTO.getDestLat());
        assertEquals(-73.9851, rideRequestDTO.getDestLng());
        assertEquals(0.7, rideRequestDTO.getTrafficIndex());
        assertEquals("sunny", rideRequestDTO.getWeather());
        assertEquals(1L, rideRequestDTO.getAssignedTaxiId());
        assertEquals(12.5, rideRequestDTO.getEta());
        assertEquals("PENDING", rideRequestDTO.getStatus());
    }

    @Test
    void testToRideRequest() {
        RideRequestDTO rideRequestDTO = new RideRequestDTO();
        rideRequestDTO.setId(1L);
        rideRequestDTO.setOriginLat(40.7128);
        rideRequestDTO.setOriginLng(-74.0060);
        rideRequestDTO.setDestLat(40.7589);
        rideRequestDTO.setDestLng(-73.9851);
        rideRequestDTO.setTrafficIndex(0.7);
        rideRequestDTO.setWeather("sunny");
        rideRequestDTO.setAssignedTaxiId(1L);
        rideRequestDTO.setEta(12.5);
        rideRequestDTO.setStatus("PENDING");

        RideRequest rideRequest = mapperService.toRideRequest(rideRequestDTO);

        assertNotNull(rideRequest);
        assertEquals(1L, rideRequest.getId());
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