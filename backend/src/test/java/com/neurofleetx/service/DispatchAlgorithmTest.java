package com.neurofleetx.service;

import com.neurofleetx.dto.DispatchResponseDTO;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.ml.ETAPredictionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Arrays;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DispatchAlgorithmTest {

    @Mock
    private TaxiService taxiService;

    @Mock
    private RideRequestService rideRequestService;

    @Mock
    private ETAPredictionService etaPredictionService;

    @InjectMocks
    private DispatchService dispatchService;

    @Test
    void testDispatchAlgorithmWithRequiredFormula() {
        // Create a ride request
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
        rideRequest.setOriginLat(40.7128);
        rideRequest.setOriginLng(-74.0060);
        rideRequest.setDestLat(40.7589);
        rideRequest.setDestLng(-73.9851);
        rideRequest.setTrafficIndex(0.7);
        rideRequest.setWeather("sunny");
        rideRequest.setTimeOfDay("morning");

        // Create available taxis with different characteristics
        Taxi taxi1 = new Taxi();
        taxi1.setId(1L);
        taxi1.setLatitude(40.7505);
        taxi1.setLongitude(-73.9934);
        taxi1.setBatteryLevel(85); // Higher battery
        taxi1.setStatus(Taxi.TaxiStatus.AVAILABLE);

        Taxi taxi2 = new Taxi();
        taxi2.setId(2L);
        taxi2.setLatitude(40.7614);
        taxi2.setLongitude(-73.9776);
        taxi2.setBatteryLevel(40); // Lower battery
        taxi2.setStatus(Taxi.TaxiStatus.AVAILABLE);

        when(rideRequestService.getRideRequestById(1L)).thenReturn(Optional.of(rideRequest));
        when(taxiService.getAvailableTaxis()).thenReturn(Arrays.asList(taxi1, taxi2));
        
        // Mock ETA predictions
        when(etaPredictionService.predictETA(
            eq(40.7128), eq(-74.0060), eq(40.7589), eq(-73.9851), eq(0.7), anyString(), anyString()))
            .thenReturn(12.5); // Same ETA for both taxis for simplicity
            
        when(taxiService.updateTaxi(any(Taxi.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(rideRequestService.updateRideRequest(any(RideRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DispatchResponseDTO response = dispatchService.dispatchTaxi(1L);

        assertNotNull(response);
        // With our weighting formula, taxi1 should be selected because it has a higher battery level
        // and the same distance/ETA, resulting in a lower score
        assertEquals(1L, response.getTaxiId());
        assertEquals(12.5, response.getEta());

        // Verify that the taxi status was updated
        assertEquals(Taxi.TaxiStatus.BUSY, taxi1.getStatus());
        
        // Verify that the ride request was updated
        assertEquals(1L, rideRequest.getTaxi().getId());
        assertEquals(12.5, rideRequest.getEta());
        assertEquals(RideRequest.RideStatus.ASSIGNED, rideRequest.getStatus());
    }
}