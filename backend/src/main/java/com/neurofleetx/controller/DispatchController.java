package com.neurofleetx.controller;

import com.neurofleetx.dto.DispatchRequestDTO;
import com.neurofleetx.dto.DispatchResponseDTO;
import com.neurofleetx.service.DispatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dispatch")
@CrossOrigin(origins = "*")
public class DispatchController {
    
    @Autowired
    private DispatchService dispatchService;
    
    @PostMapping
    public ResponseEntity<DispatchResponseDTO> dispatchTaxi(@RequestBody DispatchRequestDTO request) {
        DispatchResponseDTO response = dispatchService.dispatchTaxi(request.getRideRequestId());
        return ResponseEntity.ok(response);
    }
}