package com.neurofleetx.repository;

import com.neurofleetx.model.ModelMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModelMetricsRepository extends JpaRepository<ModelMetrics, Long> {
    // Find model with lowest (best) test RMSE
    Optional<ModelMetrics> findTopByOrderByRmseAsc();

    // Find most recent model
    Optional<ModelMetrics> findTopByOrderByTrainedAtDesc();

    // Find all models in date range
    List<ModelMetrics> findByTrainedAtBetween(LocalDateTime from, LocalDateTime to);

    // Find models with good test performance
    List<ModelMetrics> findByR2GreaterThanEqualAndRmseIsLessThanEqual(double minR2, double maxRmse);
}