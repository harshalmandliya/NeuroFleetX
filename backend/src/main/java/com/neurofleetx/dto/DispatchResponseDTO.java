package com.neurofleetx.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispatchResponseDTO {
    private Long taxiId;
    private double eta;
}