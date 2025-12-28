package com.neurofleetx.ml;

import com.neurofleetx.model.ModelMetrics;
import com.neurofleetx.repository.ModelMetricsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ETAPredictionServiceTest {

    @Mock
    private ModelMetricsRepository modelMetricsRepository;

    @InjectMocks
    private ETAPredictionService etaPredictionService;

    @Test
    void testInitializeEncodings() {
        // The encodings should be initialized in the constructor
        // We can't directly test private fields, but we can test the behavior
        assertDoesNotThrow(() -> {
            etaPredictionService.predictETA(40.7128, -74.0060, 40.7589, -73.9851, 0.7, "sunny", "morning");
        });
    }

    @Test
    void testPredictETAWithoutModel() {
        // This should throw an exception since the model is not trained
        assertThrows(IllegalStateException.class, () -> {
            etaPredictionService.predictETA(40.7128, -74.0060, 40.7589, -73.9851, 0.7, "sunny", "morning");
        });
    }
}