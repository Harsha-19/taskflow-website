import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useStats } from "../context/StatsContext";
import {
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  getMe,
  getMySubscription,
  getProjects,
  getTasks,
  toggleTask,
  updateTask,
  updateProject,
} from "../services/api";

const PLAN_NAMES = {
  1: "Starter",
  2: "Pro",
  3: "Enterprise",
};

export default function Dashboard() {
  const { stats, setStats, refreshStats } = useStats();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [userRes, subRes, statsRes] = await Promise.all([
          getMe(),
          getMySubscription(),
          refreshStats(),
        ]);
        const projectsRes = await getProjects();

        if (!cancelled) {
          setUser(userRes?.user ?? userRes);
          setPlan(subRes?.plan_id != null ? Number(subRes.plan_id) : null);
          setStats(statsRes);
          const nextProjects = projectsRes?.projects ?? [];
          setProjects(nextProjects);
          setSelectedProject((currentSelectedProject) =>
            currentSelectedProject
              ? nextProjects.find((project) => project.id === currentSelectedProject.id) ??
                nextProjects[0] ??
                null
              : nextProjects[0] ?? null
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Error loading dashboard");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      if (!selectedProject) {
        setTasks([]);
        return;
      }

      try {
        const tasksRes = await getTasks(selectedProject.id);
        if (!cancelled) {
          setTasks(tasksRes?.tasks ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Error loading tasks");
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [selectedProject]);

  if (!user && !error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="h-8 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const planName = PLAN_NAMES[plan] ?? "None";

  async function handleCreateProject(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const name = projectName.trim();
    if (!name) return;

    try {
      setError("");
      setStats((currentStats) =>
        currentStats
          ? { ...currentStats, projects: (currentStats.projects ?? 0) + 1 }
          : currentStats
      );
      const res = await createProject(name);
      const project = res?.project;
      if (!project) return;
      setProjects((currentProjects) => [project, ...currentProjects]);
      setSelectedProject(project);
      setProjectName("");
      await refreshStats();
    } catch (err) {
      await refreshStats();
      setError(err?.message || "Failed to create project");
    }
  }

  async function handleCreateTask(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const title = taskTitle.trim();
    if (!title || !selectedProject) return;

    try {
      setError("");
      setStats((currentStats) =>
        currentStats
          ? { ...currentStats, tasks: (currentStats.tasks ?? 0) + 1 }
          : currentStats
      );
      const res = await createTask({
        title,
        project_id: selectedProject.id,
        due_date: taskDueDate || null,
        priority: taskPriority,
        notes: taskNotes,
      });
      const task = res?.task;
      if (!task) return;
      setTasks((currentTasks) => [task, ...currentTasks]);
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === selectedProject.id
            ? {
                ...project,
                task_count: (project.task_count ?? 0) + 1,
                progress: project.completed_task_count
                  ? Math.round(
                      (project.completed_task_count / ((project.task_count ?? 0) + 1)) * 100
                    )
                  : 0,
              }
            : project
        )
      );
      setTaskTitle("");
      setTaskPriority("medium");
      setTaskDueDate("");
      setTaskNotes("");
      await refreshStats();
    } catch (err) {
      await refreshStats();
      setError(err?.message || "Failed to create task");
    }
  }

  async function handleSaveProject(project) {
    const name = editingProjectName.trim();
    if (!name) return;

    try {
      setError("");
      const res = await updateProject(project.id, {
        name,
        description: project.description,
        status: project.status,
      });
      const updatedProject = res?.project;
      if (!updatedProject) return;
      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === project.id ? updatedProject : currentProject
        )
      );
      setSelectedProject((currentProject) =>
        currentProject?.id === project.id ? updatedProject : currentProject
      );
      setEditingProjectId(null);
      setEditingProjectName("");
    } catch (err) {
      setError(err?.message || "Failed to update project");
    }
  }

  async function handleDeleteProject(projectId) {
    if (!window.confirm("Delete this project?")) return;

    try {
      setError("");
      setStats((currentStats) =>
        currentStats
          ? { ...currentStats, projects: Math.max((currentStats.projects ?? 0) - 1, 0) }
          : currentStats
      );
      await deleteProject(projectId);
      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId)
      );
      setSelectedProject((currentProject) =>
        currentProject?.id === projectId ? null : currentProject
      );
      setTasks((currentTasks) =>
        selectedProject?.id === projectId ? [] : currentTasks
      );
      await refreshStats();
    } catch (err) {
      await refreshStats();
      setError(err?.message || "Failed to delete project");
    }
  }

  async function handleToggleTask(taskId) {
    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask) return;

    const nextCompleted = !existingTask.completed;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: nextCompleted } : task
      )
    );

    try {
      setError("");
      const res = await toggleTask(taskId, nextCompleted);
      const updatedTask = res?.task;
      if (!updatedTask) return;

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );

      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.id !== selectedProject?.id) return project;

          const completedTaskCount =
            (project.completed_task_count ?? 0) + (nextCompleted ? 1 : -1);
          const taskCount = project.task_count ?? tasks.length;
          const progress = taskCount ? Math.round((completedTaskCount / taskCount) * 100) : 0;

          return {
            ...project,
            completed_task_count: completedTaskCount,
            progress,
          };
        })
      );
    } catch (err) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, completed: existingTask.completed } : task
        )
      );
      setError(err?.message || "Failed to update task");
    }
  }

  async function handleSaveTask(task) {
    const title = editingTaskTitle.trim();
    if (!title) return;

    try {
      setError("");
      const res = await updateTask(task.id, { title });
      const updatedTask = res?.task;
      if (!updatedTask) return;
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask
        )
      );
      setEditingTaskId(null);
      setEditingTaskTitle("");
    } catch (err) {
      setError(err?.message || "Failed to update task");
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;

    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask) return;

    try {
      setError("");
      setStats((currentStats) =>
        currentStats
          ? { ...currentStats, tasks: Math.max((currentStats.tasks ?? 0) - 1, 0) }
          : currentStats
      );
      await deleteTask(taskId);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.id !== selectedProject?.id) return project;
          const taskCount = Math.max((project.task_count ?? 0) - 1, 0);
          const completedTaskCount = Math.max(
            (project.completed_task_count ?? 0) - (existingTask.completed ? 1 : 0),
            0
          );
          const progress = taskCount ? Math.round((completedTaskCount / taskCount) * 100) : 0;
          return { ...project, task_count: taskCount, completed_task_count: completedTaskCount, progress };
        })
      );
      await refreshStats();
    } catch (err) {
      await refreshStats();
      setError(err?.message || "Failed to delete task");
    }
  }

  async function handleCyclePriority(task) {
    const order = ["low", "medium", "high"];
    const currentIndex = order.indexOf(task.priority || "medium");
    const nextPriority = order[(currentIndex + 1) % order.length];

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id ? { ...currentTask, priority: nextPriority } : currentTask
      )
    );

    try {
      setError("");
      const res = await updateTask(task.id, { priority: nextPriority });
      const updatedTask = res?.task;
      if (!updatedTask) return;
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) => (currentTask.id === task.id ? updatedTask : currentTask))
      );
    } catch (err) {
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? { ...currentTask, priority: task.priority } : currentTask
        )
      );
      setError(err?.message || "Failed to update task");
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />

      <div className="bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-24 lg:px-8">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}
          <>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Welcome back, {user?.username}
            </h1>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Account</h2>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  Username: {user?.username}
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Email: {user?.email}</p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Current Plan</h2>
                <p className="mt-3 text-lg font-bold text-blue-600">{planName}</p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Usage</h2>
                <p className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {stats ? stats.tasks ?? 0 : "Loading..."}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Stats</h2>
                <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>Projects: {stats ? stats.projects ?? 0 : "Loading..."}</p>
                  <p>Plan: {stats ? stats.plan || "None" : "Loading..."}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                <div className="mt-4">
                  <div className="mb-3 border-b border-gray-200 pb-2 last:mb-0 dark:border-gray-800">
                    <p className="text-sm text-gray-900 dark:text-gray-100">No recent activity yet.</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Activity will appear as you create projects and tasks.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={handleCreateProject}
                  placeholder="Create project and press Enter"
                  className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-blue-200 transition focus:ring-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
                <div className="mt-4 space-y-3">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left dark:border-gray-800 dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        {editingProjectId === project.id ? (
                          <input
                            value={editingProjectName}
                            onChange={(e) => setEditingProjectName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveProject(project);
                              }
                            }}
                            onBlur={() => handleSaveProject(project)}
                            className="bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-gray-100"
                            autoFocus
                          />
                        ) : (
                          <p
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingProjectId(project.id);
                              setEditingProjectName(project.name);
                            }}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          >
                            {project.name}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{project.progress ?? 0}%</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="text-xs text-gray-500 dark:text-gray-400"
                          >
                            Delete
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {project.completed_task_count ?? 0}/{project.task_count ?? 0} tasks complete
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  onKeyDown={handleCreateTask}
                  placeholder={
                    selectedProject
                      ? "Add task and press Enter"
                      : "Select a project first"
                  }
                  disabled={!selectedProject}
                  className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-blue-200 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    disabled={!selectedProject}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-blue-200 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    disabled={!selectedProject}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-blue-200 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder={selectedProject ? "Add task notes" : "Select a project first"}
                  disabled={!selectedProject}
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-blue-200 transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
                <div className="mt-4 space-y-3">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left dark:border-gray-800 dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        {editingTaskId === task.id ? (
                          <input
                            value={editingTaskTitle}
                            onChange={(e) => setEditingTaskTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveTask(task);
                              }
                            }}
                            onBlur={() => handleSaveTask(task)}
                            className="bg-transparent text-sm font-medium text-gray-900 outline-none dark:text-gray-100"
                            autoFocus
                          />
                        ) : (
                          <p
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingTaskId(task.id);
                              setEditingTaskTitle(task.title);
                            }}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          >
                            {task.title}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {task.completed ? "Completed" : "Pending"}
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="text-xs text-gray-500 dark:text-gray-400"
                          >
                            Delete
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.due_date
                            ? new Date(task.due_date).toLocaleString()
                            : "No due date"}
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCyclePriority(task);
                          }}
                          className="text-xs text-gray-500 dark:text-gray-400"
                        >
                          {task.priority ?? "medium"}
                        </span>
                      </div>
                      {task.notes && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{task.notes}</p>
                      )}
                    </button>
                  ))}
                  {selectedProject && tasks.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet.</p>
                  )}
                  {!selectedProject && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pick a project to view and manage tasks.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        </div>
      </div>

      <Footer />
    </div>
  );
}
