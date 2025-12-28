package com.neurofleetx.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Test-set metrics (main for model comparison)
    private double r2;
    private double rmse;
    private double mae;

    // Train-set metrics (to monitor overfitting)
    private Double trainR2;
    private Double trainRmse;
    private Double trainMae;

    private LocalDateTime trainedAt;
}