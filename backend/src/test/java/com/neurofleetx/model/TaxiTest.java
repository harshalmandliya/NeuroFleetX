package com.neurofleetx.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TaxiTest {

    @Test
    void testTaxiCreation() {
        Taxi taxi = new Taxi();
        taxi.setName("Test Taxi");
        taxi.setLatitude(40.7128);
        taxi.setLongitude(-74.0060);
        taxi.setBatteryLevel(85);
        taxi.setStatus(Taxi.TaxiStatus.AVAILABLE);
        
        assertEquals("Test Taxi", taxi.getName());
        assertEquals(40.7128, taxi.getLatitude());
        assertEquals(-74.0060, taxi.getLongitude());
        assertEquals(85, taxi.getBatteryLevel());
        assertEquals(Taxi.TaxiStatus.AVAILABLE, taxi.getStatus());
    }
}