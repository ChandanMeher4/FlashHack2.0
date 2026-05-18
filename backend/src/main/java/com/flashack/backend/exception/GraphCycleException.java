package com.flashack.backend.exception;

public class GraphCycleException extends RuntimeException {

	public GraphCycleException(String message) {
		super(message);
	}
}
