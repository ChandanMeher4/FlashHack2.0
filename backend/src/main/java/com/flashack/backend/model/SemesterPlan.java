package com.flashack.backend.model;

import java.util.List;

public record SemesterPlan(int semester, List<Course> courses) {
}
