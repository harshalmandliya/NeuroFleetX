package com.neurofleetx.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class ModelMetricsTest {

    @Test
    void testModelMetricsCreation() {
        ModelMetrics metrics = new ModelMetrics();
        metrics.setR2(0.85);
        metrics.setRmse(2.3);
        metrics.setMae(1.8);
        LocalDateTime now = LocalDateTime.now();
        metrics.setTrainedAt(now);
        
        assertEquals(0.85, metrics.getR2());
        assertEquals(2.3, metrics.getRmse());
        assertEquals(1.8, metrics.getMae());
        assertEquals(now, metrics.getTrainedAt());
    }
}