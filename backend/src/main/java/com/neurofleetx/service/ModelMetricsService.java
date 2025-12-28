package com.neurofleetx.service;

import com.neurofleetx.model.ModelMetrics;
import com.neurofleetx.repository.ModelMetricsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ModelMetricsService {

    @Autowired
    private ModelMetricsRepository modelMetricsRepository;

    public List<ModelMetrics> getAllMetrics() {
        return modelMetricsRepository.findAll();
    }

    public Optional<ModelMetrics> getMetricsById(Long id) {
        return modelMetricsRepository.findById(id);
    }

    public ModelMetrics saveMetrics(ModelMetrics metrics) {
        return modelMetricsRepository.save(metrics);
    }

    public void deleteMetrics(Long id) {
        modelMetricsRepository.deleteById(id);
    }
}