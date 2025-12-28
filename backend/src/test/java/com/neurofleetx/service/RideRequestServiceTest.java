package com.neurofleetx.service;

import com.neurofleetx.model.RideRequest;
import com.neurofleetx.repository.RideRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RideRequestServiceTest {

    @Mock
    private RideRequestRepository rideRequestRepository;

    @InjectMocks
    private RideRequestService rideRequestService;

    @Test
    void testGetAllRideRequests() {
        RideRequest ride1 = new RideRequest();
        ride1.setId(1L);
        ride1.setOriginLat(40.7128);

        RideRequest ride2 = new RideRequest();
        ride2.setId(2L);
        ride2.setOriginLat(34.0522);

        when(rideRequestRepository.findAll()).thenReturn(Arrays.asList(ride1, ride2));

        List<RideRequest> rides = rideRequestService.getAllRideRequests();

        assertNotNull(rides);
        assertEquals(2, rides.size());
        assertEquals(40.7128, rides.get(0).getOriginLat());
        assertEquals(34.0522, rides.get(1).getOriginLat());
    }

    @Test
    void testGetRideRequestById() {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
        rideRequest.setOriginLat(40.7128);

        when(rideRequestRepository.findById(1L)).thenReturn(Optional.of(rideRequest));

        Optional<RideRequest> result = rideRequestService.getRideRequestById(1L);

        assertTrue(result.isPresent());
        assertEquals(40.7128, result.get().getOriginLat());
    }

    @Test
    void testSaveRideRequest() {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setOriginLat(40.7128);

        RideRequest savedRideRequest = new RideRequest();
        savedRideRequest.setId(1L);
        savedRideRequest.setOriginLat(40.7128);

        when(rideRequestRepository.save(any(RideRequest.class))).thenReturn(savedRideRequest);

        RideRequest result = rideRequestService.saveRideRequest(rideRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(40.7128, result.getOriginLat());
    }

    @Test
    void testUpdateRideRequest() {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
        rideRequest.setOriginLat(40.7128);

        when(rideRequestRepository.save(any(RideRequest.class))).thenReturn(rideRequest);

        RideRequest result = rideRequestService.updateRideRequest(rideRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(40.7128, result.getOriginLat());
    }

    @Test
    void testDeleteRideRequest() {
        assertDoesNotThrow(() -> {
            rideRequestService.deleteRideRequest(1L);
        });

        verify(rideRequestRepository, times(1)).deleteById(1L);
    }
}