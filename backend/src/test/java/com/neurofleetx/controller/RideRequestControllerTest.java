package com.neurofleetx.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurofleetx.dto.RideRequestDTO;
import com.neurofleetx.model.RideRequest;
import com.neurofleetx.service.MapperService;
import com.neurofleetx.service.RideRequestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Arrays;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RideRequestController.class)
class RideRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RideRequestService rideRequestService;

    @MockBean
    private MapperService mapperService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllRideRequests() throws Exception {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
        rideRequest.setOriginLat(40.7128);
        rideRequest.setOriginLng(-74.0060);
        rideRequest.setDestLat(40.7589);
        rideRequest.setDestLng(-73.9851);
        rideRequest.setTrafficIndex(0.7);
        rideRequest.setWeather("sunny");
        rideRequest.setAssignedTaxiId(1L);
        rideRequest.setEta(12.5);
        rideRequest.setStatus(RideRequest.RideStatus.PENDING);

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

        when(rideRequestService.getAllRideRequests()).thenReturn(Arrays.asList(rideRequest));
        when(mapperService.toRideRequestDTO(any(RideRequest.class))).thenReturn(rideRequestDTO);

        mockMvc.perform(get("/api/rides"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].originLat").value(40.7128));

        verify(rideRequestService, times(1)).getAllRideRequests();
    }

    @Test
    void testCreateRideRequest() throws Exception {
        RideRequestDTO rideRequestDTO = new RideRequestDTO();
        rideRequestDTO.setOriginLat(40.7128);
        rideRequestDTO.setOriginLng(-74.0060);
        rideRequestDTO.setDestLat(40.7589);
        rideRequestDTO.setDestLng(-73.9851);
        rideRequestDTO.setTrafficIndex(0.7);
        rideRequestDTO.setWeather("sunny");
        rideRequestDTO.setStatus("PENDING");

        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
        rideRequest.setOriginLat(40.7128);
        rideRequest.setOriginLng(-74.0060);
        rideRequest.setDestLat(40.7589);
        rideRequest.setDestLng(-73.9851);
        rideRequest.setTrafficIndex(0.7);
        rideRequest.setWeather("sunny");
        rideRequest.setStatus(RideRequest.RideStatus.PENDING);

        when(mapperService.toRideRequest(any(RideRequestDTO.class))).thenReturn(rideRequest);
        when(rideRequestService.saveRideRequest(any(RideRequest.class))).thenReturn(rideRequest);
        when(mapperService.toRideRequestDTO(any(RideRequest.class))).thenReturn(rideRequestDTO);

        mockMvc.perform(post("/api/rides")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rideRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.originLat").value(40.7128));

        verify(rideRequestService, times(1)).saveRideRequest(any(RideRequest.class));
    }

    @Test
    void testUpdateRideRequest() throws Exception {
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
        rideRequestDTO.setStatus("ASSIGNED");

        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
        rideRequest.setOriginLat(40.7128);
        rideRequest.setOriginLng(-74.0060);
        rideRequest.setDestLat(40.7589);
        rideRequest.setDestLng(-73.9851);
        rideRequest.setTrafficIndex(0.7);
        rideRequest.setWeather("sunny");
        rideRequest.setAssignedTaxiId(1L);
        rideRequest.setEta(12.5);
        rideRequest.setStatus(RideRequest.RideStatus.ASSIGNED);

        when(rideRequestService.getRideRequestById(1L)).thenReturn(Optional.of(new RideRequest()));
        when(mapperService.toRideRequest(any(RideRequestDTO.class))).thenReturn(rideRequest);
        when(rideRequestService.updateRideRequest(any(RideRequest.class))).thenReturn(rideRequest);
        when(mapperService.toRideRequestDTO(any(RideRequest.class))).thenReturn(rideRequestDTO);

        mockMvc.perform(put("/api/rides/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rideRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("ASSIGNED"));

        verify(rideRequestService, times(1)).updateRideRequest(any(RideRequest.class));
    }

    @Test
    void testDeleteRideRequest() throws Exception {
        when(rideRequestService.getRideRequestById(1L)).thenReturn(Optional.of(new RideRequest()));

        mockMvc.perform(delete("/api/rides/1"))
                .andExpect(status().isNoContent());

        verify(rideRequestService, times(1)).deleteRideRequest(1L);
    }
}