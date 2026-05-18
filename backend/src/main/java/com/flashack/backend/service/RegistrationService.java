package com.flashack.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.flashack.backend.exception.CourseNotFoundException;
import com.flashack.backend.model.Course;
import com.flashack.backend.model.RegistrationResult;

@Service
public class RegistrationService {

	private static final int RACE_WINDOW_MS = 5;

	private final Map<String, Integer> availableSeats = new HashMap<>();
	private final Map<String, Integer> initialSeats = new HashMap<>();

	public RegistrationService(CurriculumService curriculumService) {
		for (Course course : curriculumService.getAllCourses()) {
			initialSeats.put(course.courseId(), course.availableSeats());
			availableSeats.put(course.courseId(), course.availableSeats());
		}
	}

	public synchronized void resetSeats(String courseId) {
		requireCourse(courseId);
		availableSeats.put(courseId, initialSeats.get(courseId));
	}

	public int getAvailableSeats(String courseId) {
		requireCourse(courseId);
		return availableSeats.get(courseId);
	}

	/**
	 * Check-then-act without synchronization; a short delay widens the race window for demos.
	 */
	public RegistrationResult registerUnsafe(String courseId) {
		requireCourse(courseId);

		int currentSeats = availableSeats.get(courseId);
		widenRaceWindow();

		if (currentSeats <= 0) {
			return new RegistrationResult(courseId, false, 0);
		}

		availableSeats.put(courseId, currentSeats - 1);
		return new RegistrationResult(courseId, true, availableSeats.get(courseId));
	}

	public synchronized RegistrationResult registerSafe(String courseId) {
		requireCourse(courseId);

		int currentSeats = availableSeats.get(courseId);
		if (currentSeats <= 0) {
			return new RegistrationResult(courseId, false, 0);
		}

		int remainingSeats = currentSeats - 1;
		availableSeats.put(courseId, remainingSeats);
		return new RegistrationResult(courseId, true, remainingSeats);
	}

	private void requireCourse(String courseId) {
		if (!availableSeats.containsKey(courseId)) {
			throw new CourseNotFoundException(courseId);
		}
	}

	private static void widenRaceWindow() {
		try {
			Thread.sleep(RACE_WINDOW_MS);
		}
		catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
		}
	}
}
