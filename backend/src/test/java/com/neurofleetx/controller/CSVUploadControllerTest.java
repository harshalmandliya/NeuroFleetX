package com.neurofleetx.controller;

import com.neurofleetx.ml.ETAPredictionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CSVUploadController.class)
class CSVUploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ETAPredictionService etaPredictionService;

    @Test
    void testUploadCSV() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.csv",
                "text/csv",
                "request_id,origin_lat,origin_lng,dest_lat,dest_lng,distance,time_of_day,vehicle_id,battery_level,speed,trip_time\n1,40.7128,-74.0060,40.7589,-73.9851,5.2,morning,1,85,35,12.5".getBytes()
        );

        doNothing().when(etaPredictionService).trainModel(org.mockito.ArgumentMatchers.anyString());

        mockMvc.perform(multipart("/api/csv/upload")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(content().string("File uploaded and model trained successfully"));
    }
}