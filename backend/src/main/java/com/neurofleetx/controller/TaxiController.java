package com.neurofleetx.controller;

import com.neurofleetx.dto.TaxiDTO;
import com.neurofleetx.model.Taxi;
import com.neurofleetx.service.MapperService;
import com.neurofleetx.service.TaxiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/taxis")
@CrossOrigin(origins = "*")
public class TaxiController {
    
    @Autowired
    private TaxiService taxiService;
    
    @Autowired
    private MapperService mapperService;
    
    @GetMapping
    public ResponseEntity<List<TaxiDTO>> getAllTaxis() {
        List<Taxi> taxis = taxiService.getAllTaxis();
        List<TaxiDTO> taxiDTOs = taxis.stream()
                .map(mapperService::toTaxiDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taxiDTOs);
    }
    
    @PostMapping
    public ResponseEntity<TaxiDTO> createTaxi(@RequestBody TaxiDTO taxiDTO) {
        Taxi taxi = mapperService.toTaxi(taxiDTO);
        Taxi savedTaxi = taxiService.saveTaxi(taxi);
        TaxiDTO savedTaxiDTO = mapperService.toTaxiDTO(savedTaxi);
        return ResponseEntity.ok(savedTaxiDTO);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TaxiDTO> updateTaxi(@PathVariable Long id, @RequestBody TaxiDTO taxiDTO) {
        if (!taxiService.getTaxiById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        taxiDTO.setId(id);
        Taxi taxi = mapperService.toTaxi(taxiDTO);
        Taxi updatedTaxi = taxiService.updateTaxi(taxi);
        TaxiDTO updatedTaxiDTO = mapperService.toTaxiDTO(updatedTaxi);
        return ResponseEntity.ok(updatedTaxiDTO);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaxi(@PathVariable Long id) {
        if (!taxiService.getTaxiById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        taxiService.deleteTaxi(id);
        return ResponseEntity.noContent().build();
    }
}