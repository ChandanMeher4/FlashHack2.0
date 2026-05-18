package com.flashack.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flashack.backend.model.RegistrationResult;
import com.flashack.backend.service.RegistrationService;

@RestController
@RequestMapping("/api/registration")
public class RegistrationController {

	private final RegistrationService registrationService;

	public RegistrationController(RegistrationService registrationService) {
		this.registrationService = registrationService;
	}

	@PostMapping("/unsafe/{courseId}")
	public RegistrationResult registerUnsafe(@PathVariable String courseId) {
		return registrationService.registerUnsafe(courseId);
	}

	@PostMapping("/safe/{courseId}")
	public RegistrationResult registerSafe(@PathVariable String courseId) {
		return registrationService.registerSafe(courseId);
	}

	@GetMapping("/seats/{courseId}")
	public int getAvailableSeats(@PathVariable String courseId) {
		return registrationService.getAvailableSeats(courseId);
	}

	@PostMapping("/reset/{courseId}")
	public int resetSeats(@PathVariable String courseId) {
		registrationService.resetSeats(courseId);
		return registrationService.getAvailableSeats(courseId);
	}
}
