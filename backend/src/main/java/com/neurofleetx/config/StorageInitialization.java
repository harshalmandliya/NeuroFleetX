package com.neurofleetx.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class StorageInitialization {
    
    private static final Logger logger = LoggerFactory.getLogger(StorageInitialization.class);

    @PostConstruct
    public void init() {
        // Create upload directories if they don't exist
        createDirectoryIfNotExists("uploads/profile-pictures/");
    }

    private void createDirectoryIfNotExists(String path) {
        File directory = new File(path);
        if (!directory.exists()) {
            if (directory.mkdirs()) {
                logger.info("Created directory: {}", path);
            } else {
                logger.error("Failed to create directory: {}", path);
            }
        } else {
            logger.info("Directory already exists: {}", path);
        }
        
        // Ensure the directory is writable
        if (!directory.canWrite()) {
            logger.warn("Directory is not writable: {}", path);
        }
    }
}