package com.flashack.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flashack.backend.model.CompletedCoursesRequest;
import com.flashack.backend.model.Course;
import com.flashack.backend.model.SemesterPlan;
import com.flashack.backend.service.CurriculumService;

@RestController
@RequestMapping("/api/curriculum")
public class CurriculumController {

	private final CurriculumService curriculumService;

	public CurriculumController(CurriculumService curriculumService) {
		this.curriculumService = curriculumService;
	}

	@GetMapping("/sorted")
	public List<Course> getSortedCurriculum() {
		return curriculumService.getTopologicallySortedCourses();
	}

	@PostMapping("/remaining-plan")
	public List<Course> getRemainingPlan(@RequestBody CompletedCoursesRequest request) {
		return curriculumService.getRemainingPlan(request.completedCourses());
	}

	@PostMapping("/semester-plan")
	public List<SemesterPlan> getSemesterPlan(@RequestBody CompletedCoursesRequest request) {
		return curriculumService.getSemesterPlan(request.completedCourses());
	}
}
