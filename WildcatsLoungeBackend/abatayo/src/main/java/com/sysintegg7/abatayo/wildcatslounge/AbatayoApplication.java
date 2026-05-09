package com.sysintegg7.abatayo.wildcatslounge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AbatayoApplication {

	public static void main(String[] args) {
		SpringApplication.run(AbatayoApplication.class, args);
	}

}
