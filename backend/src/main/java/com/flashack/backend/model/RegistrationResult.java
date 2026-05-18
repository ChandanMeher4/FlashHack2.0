package com.flashack.backend.model;

public record RegistrationResult(
		String courseId,
		boolean registered,
		int remainingSeats) {
}
