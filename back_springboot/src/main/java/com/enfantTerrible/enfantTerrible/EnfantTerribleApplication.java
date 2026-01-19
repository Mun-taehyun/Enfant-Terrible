package com.enfantTerrible.enfantTerrible;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableScheduling
public class EnfantTerribleApplication {

	public static void main(String[] args) {
		SpringApplication.run(EnfantTerribleApplication.class, args);
	}

}
