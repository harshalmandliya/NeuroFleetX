package com.neurofleetx.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurofleetx.dto.TaxiDTO;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.service.MapperService;
import com.neurofleetx.service.TaxiService;
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

@WebMvcTest(TaxiController.class)
class TaxiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaxiService taxiService;

    @MockBean
    private MapperService mapperService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllTaxis() throws Exception {
        Taxi taxi = new Taxi();
        taxi.setId(1L);
        taxi.setName("Test Taxi");
        taxi.setLatitude(40.7128);
        taxi.setLongitude(-74.0060);
        taxi.setBatteryLevel(85);
        taxi.setStatus(Taxi.TaxiStatus.AVAILABLE);

        TaxiDTO taxiDTO = new TaxiDTO();
        taxiDTO.setId(1L);
        taxiDTO.setName("Test Taxi");
        taxiDTO.setLatitude(40.7128);
        taxiDTO.setLongitude(-74.0060);
        taxiDTO.setBatteryLevel(85);
        taxiDTO.setStatus("AVAILABLE");

        when(taxiService.getAllTaxis()).thenReturn(Arrays.asList(taxi));
        when(mapperService.toTaxiDTO(any(Taxi.class))).thenReturn(taxiDTO);

        mockMvc.perform(get("/api/taxis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Test Taxi"));

        verify(taxiService, times(1)).getAllTaxis();
    }

    @Test
    void testCreateTaxi() throws Exception {
        TaxiDTO taxiDTO = new TaxiDTO();
        taxiDTO.setName("Test Taxi");
        taxiDTO.setLatitude(40.7128);
        taxiDTO.setLongitude(-74.0060);
        taxiDTO.setBatteryLevel(85);
        taxiDTO.setStatus("AVAILABLE");

        Taxi taxi = new Taxi();
        taxi.setId(1L);
        taxi.setName("Test Taxi");
        taxi.setLatitude(40.7128);
        taxi.setLongitude(-74.0060);
        taxi.setBatteryLevel(85);
        taxi.setStatus(Taxi.TaxiStatus.AVAILABLE);

        when(mapperService.toTaxi(any(TaxiDTO.class))).thenReturn(taxi);
        when(taxiService.saveTaxi(any(Taxi.class))).thenReturn(taxi);
        when(mapperService.toTaxiDTO(any(Taxi.class))).thenReturn(taxiDTO);

        mockMvc.perform(post("/api/taxis")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taxiDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test Taxi"));

        verify(taxiService, times(1)).saveTaxi(any(Taxi.class));
    }

    @Test
    void testUpdateTaxi() throws Exception {
        TaxiDTO taxiDTO = new TaxiDTO();
        taxiDTO.setId(1L);
        taxiDTO.setName("Updated Taxi");
        taxiDTO.setLatitude(40.7128);
        taxiDTO.setLongitude(-74.0060);
        taxiDTO.setBatteryLevel(90);
        taxiDTO.setStatus("AVAILABLE");

        Taxi taxi = new Taxi();
        taxi.setId(1L);
        taxi.setName("Updated Taxi");
        taxi.setLatitude(40.7128);
        taxi.setLongitude(-74.0060);
        taxi.setBatteryLevel(90);
        taxi.setStatus(Taxi.TaxiStatus.AVAILABLE);

        when(taxiService.getTaxiById(1L)).thenReturn(Optional.of(new Taxi()));
        when(mapperService.toTaxi(any(TaxiDTO.class))).thenReturn(taxi);
        when(taxiService.updateTaxi(any(Taxi.class))).thenReturn(taxi);
        when(mapperService.toTaxiDTO(any(Taxi.class))).thenReturn(taxiDTO);

        mockMvc.perform(put("/api/taxis/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taxiDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Updated Taxi"));

        verify(taxiService, times(1)).updateTaxi(any(Taxi.class));
    }

    @Test
    void testDeleteTaxi() throws Exception {
        when(taxiService.getTaxiById(1L)).thenReturn(Optional.of(new Taxi()));

        mockMvc.perform(delete("/api/taxis/1"))
                .andExpect(status().isNoContent());

        verify(taxiService, times(1)).deleteTaxi(1L);
    }
}