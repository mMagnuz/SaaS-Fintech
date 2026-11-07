package br.com.fiap.fintech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class FintechApplication {

	static void main(String[] args) {
		SpringApplication.run(FintechApplication.class, args);
	}

}
