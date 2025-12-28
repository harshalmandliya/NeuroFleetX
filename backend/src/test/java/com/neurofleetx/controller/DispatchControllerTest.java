package com.neurofleetx.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurofleetx.dto.DispatchRequestDTO;
import com.neurofleetx.dto.DispatchResponseDTO;
import com.neurofleetx.service.DispatchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DispatchController.class)
class DispatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DispatchService dispatchService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testDispatchTaxi() throws Exception {
        DispatchRequestDTO requestDTO = new DispatchRequestDTO();
        requestDTO.setRideRequestId(1L);

        DispatchResponseDTO responseDTO = new DispatchResponseDTO();
        responseDTO.setTaxiId(1L);
        responseDTO.setEta(12.5);

        when(dispatchService.dispatchTaxi(anyLong())).thenReturn(responseDTO);

        mockMvc.perform(post("/api/dispatch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taxiId").value(1L))
                .andExpect(jsonPath("$.eta").value(12.5));
    }
}