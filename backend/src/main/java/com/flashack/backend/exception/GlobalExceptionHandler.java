package com.flashack.backend.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(GraphCycleException.class)
	public ResponseEntity<Map<String, String>> handleGraphCycle(GraphCycleException exception) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(Map.of("error", exception.getMessage()));
	}

	@ExceptionHandler(CourseNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleCourseNotFound(CourseNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("error", exception.getMessage()));
	}

	@ExceptionHandler(InvalidCourseException.class)
	public ResponseEntity<Map<String, String>> handleInvalidCourse(InvalidCourseException exception) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of("error", exception.getMessage()));
	}
}
