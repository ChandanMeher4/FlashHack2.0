package com.flashack.backend.exception;

public class CourseNotFoundException extends RuntimeException {

	public CourseNotFoundException(String courseId) {
		super("Course not found: " + courseId);
	}
}
