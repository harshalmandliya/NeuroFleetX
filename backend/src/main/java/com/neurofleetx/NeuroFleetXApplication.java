package com.neurofleetx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.neurofleetx.model")
@EnableJpaRepositories(basePackages = "com.neurofleetx.repository")
public class NeuroFleetXApplication {

	public static void main(String[] args) {
		SpringApplication.run(NeuroFleetXApplication.class, args);
	}

}