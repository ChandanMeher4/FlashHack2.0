package com.flashack.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.flashack.backend.exception.GraphCycleException;
import com.flashack.backend.exception.InvalidCourseException;
import com.flashack.backend.model.Course;
import com.flashack.backend.model.SemesterPlan;

@Service
public class CurriculumService {

	private static final String CURRICULUM_RESOURCE = "curriculum.json";
	private static final int MAX_COURSES_PER_SEMESTER = 4;

	private final ObjectMapper objectMapper;
	private final Map<String, Course> coursesById;
	private final Map<String, List<String>> adjacencyList;

	public CurriculumService(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
		List<Course> courses = loadCourses();
		this.coursesById = indexCourses(courses);
		this.adjacencyList = buildAdjacencyList(courses);
	}

	public Map<String, List<String>> getAdjacencyList() {
		return Map.copyOf(adjacencyList);
	}

	public List<Course> getTopologicallySortedCourses() {
		List<String> sortedIds = topologicalSort(adjacencyList);
		return sortedIds.stream().map(coursesById::get).toList();
	}

	public List<Course> getRemainingPlan(List<String> completedCourseIds) {
		Set<String> completed = validateCompletedCourses(completedCourseIds);
		Map<String, List<String>> reducedGraph = buildReducedAdjacencyList(completed);
		List<String> sortedIds = topologicalSort(reducedGraph);
		return sortedIds.stream()
				.map(coursesById::get)
				.map(course -> filterCompletedPrerequisites(course, completed))
				.toList();
	}

	public List<SemesterPlan> getSemesterPlan(List<String> completedCourseIds) {
		List<Course> remainingPlan = getRemainingPlan(completedCourseIds);
		return groupIntoSemesters(remainingPlan);
	}

	public List<Course> getAllCourses() {
		return List.copyOf(coursesById.values());
	}

	public Course getCourse(String courseId) {
		return coursesById.get(courseId);
	}

	/**
	 * Assigns each course to the earliest semester where prerequisites are met and capacity allows.
	 */
	public List<SemesterPlan> groupIntoSemesters(List<Course> topologicallySortedCourses) {
		List<List<Course>> semesters = new ArrayList<>();
		Map<String, Integer> semesterByCourse = new LinkedHashMap<>();

		for (Course course : topologicallySortedCourses) {
			int semester = earliestEligibleSemester(course, semesterByCourse);
			semester = firstSemesterWithCapacity(semester, semesters);
			ensureSemesterExists(semesters, semester);
			semesters.get(semester - 1).add(course);
			semesterByCourse.put(course.courseId(), semester);
		}

		List<SemesterPlan> plan = new ArrayList<>(semesters.size());
		for (int index = 0; index < semesters.size(); index++) {
			plan.add(new SemesterPlan(index + 1, List.copyOf(semesters.get(index))));
		}
		return plan;
	}

	private Set<String> validateCompletedCourses(List<String> completedCourseIds) {
		Set<String> completed = new HashSet<>();
		if (completedCourseIds == null) {
			return completed;
		}
		for (String courseId : completedCourseIds) {
			if (!coursesById.containsKey(courseId)) {
				throw new InvalidCourseException("Unknown completed course: " + courseId);
			}
			completed.add(courseId);
		}
		return completed;
	}

	private Map<String, List<String>> buildReducedAdjacencyList(Set<String> completed) {
		Map<String, List<String>> reduced = new LinkedHashMap<>();

		for (String courseId : coursesById.keySet()) {
			if (completed.contains(courseId)) {
				continue;
			}
			List<String> remainingDependents = adjacencyList.getOrDefault(courseId, List.of()).stream()
					.filter(dependentId -> !completed.contains(dependentId))
					.collect(Collectors.toCollection(ArrayList::new));
			reduced.put(courseId, remainingDependents);
		}

		return reduced;
	}

	private static Course filterCompletedPrerequisites(Course course, Set<String> completed) {
		List<String> remainingPrerequisites = course.prerequisites().stream()
				.filter(prerequisiteId -> !completed.contains(prerequisiteId))
				.toList();
		return new Course(
				course.courseId(),
				course.courseName(),
				course.availableSeats(),
				remainingPrerequisites);
	}

	private static int earliestEligibleSemester(Course course, Map<String, Integer> semesterByCourse) {
		int semester = 1;
		for (String prerequisiteId : course.prerequisites()) {
			Integer prerequisiteSemester = semesterByCourse.get(prerequisiteId);
			if (prerequisiteSemester != null) {
				semester = Math.max(semester, prerequisiteSemester + 1);
			}
		}
		return semester;
	}

	private static int firstSemesterWithCapacity(int semester, List<List<Course>> semesters) {
		while (semester > semesters.size() || semesters.get(semester - 1).size() >= MAX_COURSES_PER_SEMESTER) {
			semester++;
		}
		return semester;
	}

	private static void ensureSemesterExists(List<List<Course>> semesters, int semester) {
		while (semesters.size() < semester) {
			semesters.add(new ArrayList<>());
		}
	}

	private List<Course> loadCourses() {
		ClassPathResource resource = new ClassPathResource(CURRICULUM_RESOURCE);
		try (InputStream inputStream = resource.getInputStream()) {
			return objectMapper.readValue(inputStream, new TypeReference<List<Course>>() {
			});
		}
		catch (IOException exception) {
			throw new IllegalStateException("Failed to load curriculum from " + CURRICULUM_RESOURCE, exception);
		}
	}

	private static Map<String, Course> indexCourses(List<Course> courses) {
		Map<String, Course> index = new LinkedHashMap<>();
		for (Course course : courses) {
			index.put(course.courseId(), course);
		}
		return index;
	}

	/**
	 * Directed graph: prerequisite -> dependent course (edge points from prereq to course).
	 */
	private Map<String, List<String>> buildAdjacencyList(List<Course> courses) {
		Map<String, List<String>> graph = new LinkedHashMap<>();
		for (Course course : courses) {
			graph.putIfAbsent(course.courseId(), new ArrayList<>());
			for (String prerequisiteId : course.prerequisites()) {
				graph.computeIfAbsent(prerequisiteId, ignored -> new ArrayList<>()).add(course.courseId());
			}
		}
		return graph;
	}

	/**
	 * Decrease-and-conquer topological sort: DFS on each unvisited vertex, post-order stack.
	 * Cycle detection via GRAY (on recursion stack) vertices.
	 */
	private List<String> topologicalSort(Map<String, List<String>> graph) {
		Set<String> visited = new HashSet<>();
		Set<String> onStack = new HashSet<>();
		Deque<String> stack = new ArrayDeque<>();
		Deque<String> path = new ArrayDeque<>();

		for (String courseId : graph.keySet()) {
			if (!visited.contains(courseId)) {
				dfs(courseId, graph, visited, onStack, path, stack);
			}
		}

		List<String> sorted = new ArrayList<>(stack.size());
		while (!stack.isEmpty()) {
			sorted.add(stack.pop());
		}
		return sorted;
	}

	private void dfs(
			String courseId,
			Map<String, List<String>> graph,
			Set<String> visited,
			Set<String> onStack,
			Deque<String> path,
			Deque<String> stack) {
		if (onStack.contains(courseId)) {
			throw new GraphCycleException(buildCycleMessage(courseId, path));
		}
		if (visited.contains(courseId)) {
			return;
		}

		onStack.add(courseId);
		path.addLast(courseId);

		for (String dependentId : graph.getOrDefault(courseId, List.of())) {
			dfs(dependentId, graph, visited, onStack, path, stack);
		}

		path.removeLast();
		onStack.remove(courseId);
		visited.add(courseId);
		stack.push(courseId);
	}

	private static String buildCycleMessage(String cycleNode, Deque<String> path) {
		List<String> cycle = new ArrayList<>();
		boolean inCycle = false;
		for (String node : path) {
			if (node.equals(cycleNode)) {
				inCycle = true;
			}
			if (inCycle) {
				cycle.add(node);
			}
		}
		cycle.add(cycleNode);
		return "Cycle detected in curriculum prerequisite graph: " + String.join(" -> ", cycle);
	}
}
