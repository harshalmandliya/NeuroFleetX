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
class DispatchServiceTest {

    @Mock
    private TaxiService taxiService;

    @Mock
    private RideRequestService rideRequestService;

    @Mock
    private ETAPredictionService etaPredictionService;

    @InjectMocks
    private DispatchService dispatchService;

    @Test
    void testDispatchTaxi() {
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

        // Create available taxis
        Taxi taxi1 = new Taxi();
        taxi1.setId(1L);
        taxi1.setLatitude(40.7505);
        taxi1.setLongitude(-73.9934);
        taxi1.setBatteryLevel(85);
        taxi1.setStatus(Taxi.TaxiStatus.AVAILABLE);

        Taxi taxi2 = new Taxi();
        taxi2.setId(2L);
        taxi2.setLatitude(40.7614);
        taxi2.setLongitude(-73.9776);
        taxi2.setBatteryLevel(92);
        taxi2.setStatus(Taxi.TaxiStatus.AVAILABLE);

        when(rideRequestService.getRideRequestById(1L)).thenReturn(Optional.of(rideRequest));
        when(taxiService.getAvailableTaxis()).thenReturn(Arrays.asList(taxi1, taxi2));
        when(etaPredictionService.predictETA(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString(), anyString()))
                .thenReturn(12.5); // Predicted ETA for taxi1
        when(etaPredictionService.predictETA(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString(), anyString()))
                .thenReturn(15.2); // Predicted ETA for taxi2

        when(taxiService.updateTaxi(any(Taxi.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(rideRequestService.updateRideRequest(any(RideRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DispatchResponseDTO response = dispatchService.dispatchTaxi(1L);

        assertNotNull(response);
        assertEquals(1L, response.getTaxiId()); // taxi1 should be selected as it has a lower score
        assertEquals(12.5, response.getEta());

        // Verify that the taxi status was updated
        assertEquals(Taxi.TaxiStatus.BUSY, taxi1.getStatus());
        
        // Verify that the ride request was updated
        assertEquals(1L, rideRequest.getTaxi().getId());
        assertEquals(12.5, rideRequest.getEta());
        assertEquals(RideRequest.RideStatus.ASSIGNED, rideRequest.getStatus());
    }
}