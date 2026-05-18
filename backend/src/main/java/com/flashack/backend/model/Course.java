package com.flashack.backend.model;

import java.util.List;

public record Course(
		String courseId,
		String courseName,
		int availableSeats,
		List<String> prerequisites) {
}
