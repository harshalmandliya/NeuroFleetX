package com.neurofleetx.service;

import com.neurofleetx.model.Taxi;
import com.neurofleetx.repository.TaxiRepository;
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
class TaxiServiceTest {

    @Mock
    private TaxiRepository taxiRepository;

    @InjectMocks
    private TaxiService taxiService;

    @Test
    void testGetAllTaxis() {
        Taxi taxi1 = new Taxi();
        taxi1.setId(1L);
        taxi1.setName("Taxi 1");

        Taxi taxi2 = new Taxi();
        taxi2.setId(2L);
        taxi2.setName("Taxi 2");

        when(taxiRepository.findAll()).thenReturn(Arrays.asList(taxi1, taxi2));

        List<Taxi> taxis = taxiService.getAllTaxis();

        assertNotNull(taxis);
        assertEquals(2, taxis.size());
        assertEquals("Taxi 1", taxis.get(0).getName());
        assertEquals("Taxi 2", taxis.get(1).getName());
    }

    @Test
    void testGetTaxiById() {
        Taxi taxi = new Taxi();
        taxi.setId(1L);
        taxi.setName("Test Taxi");

        when(taxiRepository.findById(1L)).thenReturn(Optional.of(taxi));

        Optional<Taxi> result = taxiService.getTaxiById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Taxi", result.get().getName());
    }

    @Test
    void testSaveTaxi() {
        Taxi taxi = new Taxi();
        taxi.setName("Test Taxi");

        Taxi savedTaxi = new Taxi();
        savedTaxi.setId(1L);
        savedTaxi.setName("Test Taxi");

        when(taxiRepository.save(any(Taxi.class))).thenReturn(savedTaxi);

        Taxi result = taxiService.saveTaxi(taxi);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Taxi", result.getName());
    }

    @Test
    void testUpdateTaxi() {
        Taxi taxi = new Taxi();
        taxi.setId(1L);
        taxi.setName("Updated Taxi");

        when(taxiRepository.save(any(Taxi.class))).thenReturn(taxi);

        Taxi result = taxiService.updateTaxi(taxi);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Updated Taxi", result.getName());
    }

    @Test
    void testDeleteTaxi() {
        assertDoesNotThrow(() -> {
            taxiService.deleteTaxi(1L);
        });

        verify(taxiRepository, times(1)).deleteById(1L);
    }

    @Test
    void testGetAvailableTaxis() {
        Taxi taxi = new Taxi();
        taxi.setId(1L);
        taxi.setName("Available Taxi");
        taxi.setBatteryLevel(85);
        taxi.setStatus(Taxi.TaxiStatus.AVAILABLE);

        when(taxiRepository.findAvailableTaxisWithBattery(20, Taxi.TaxiStatus.AVAILABLE))
                .thenReturn(Arrays.asList(taxi));

        List<Taxi> availableTaxis = taxiService.getAvailableTaxis();

        assertNotNull(availableTaxis);
        assertEquals(1, availableTaxis.size());
        assertEquals("Available Taxi", availableTaxis.get(0).getName());
    }
}