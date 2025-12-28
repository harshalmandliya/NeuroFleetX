package com.neurofleetx.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurofleetx.dto.PredictionRequestDTO;
import com.neurofleetx.dto.PredictionResponseDTO;
import com.neurofleetx.ml.ETAPredictionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PredictionController.class)
class PredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ETAPredictionService etaPredictionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testPredictETA() throws Exception {
        PredictionRequestDTO requestDTO = new PredictionRequestDTO();
        requestDTO.setOriginLat(40.7128);
        requestDTO.setOriginLng(-74.0060);
        requestDTO.setDestLat(40.7589);
        requestDTO.setDestLng(-73.9851);
        requestDTO.setTrafficIndex(0.7);
        requestDTO.setWeather("sunny");
        requestDTO.setTimeOfDay("morning");

        PredictionResponseDTO responseDTO = new PredictionResponseDTO();
        responseDTO.setPredictedETA(12.5);

        when(etaPredictionService.predictETA(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString(), anyString()))
                .thenReturn(12.5);

        mockMvc.perform(post("/api/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictedETA").value(12.5));
    }
}