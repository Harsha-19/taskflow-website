import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStats } from "@/context/StatsContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const PLAN_NAMES = {
  1: "Starter",
  2: "Pro",
  3: "Enterprise",
};

export default function Dashboard() {
  const { stats, setStats, refreshStats } = useStats();
  const { user } = useAuth();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [subRes, statsRes] = await Promise.all([
          api.subscriptions.getCurrent(),
          refreshStats(),
        ]);
        const projectsRes = await api.projects.list();

        setPlan(subRes.data.subscription?.plan_id != null ? Number(subRes.data.subscription.plan_id) : null);
        const nextProjects = projectsRes.data.projects ?? [];
        setProjects(nextProjects);
        
        if (nextProjects.length > 0) {
          setSelectedProject(nextProjects[0]);
        }
      } catch (err) {
        toast.error(err.message || "Error loading dashboard");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function loadTasks() {
      if (!selectedProject) {
        setTasks([]);
        return;
      }

      try {
        const tasksRes = await api.tasks.list(selectedProject.id);
        setTasks(tasksRes.data.tasks ?? []);
      } catch (err) {
        toast.error(err.message || "Error loading tasks");
      }
    }

    loadTasks();
  }, [selectedProject]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-pulse">
            <div className="h-8 w-56 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800" />
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
      const res = await api.projects.create({ name });
      const newProject = res.data.project;
      setProjects((current) => [newProject, ...current]);
      setSelectedProject(newProject);
      setProjectName("");
      toast.success("Project created");
      refreshStats();
    } catch (err) {
      toast.error(err.message || "Failed to create project");
    }
  }

  async function handleCreateTask(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const title = taskTitle.trim();
    if (!title || !selectedProject) return;

    try {
      const res = await api.tasks.create({
        title,
        project_id: selectedProject.id,
        due_date: taskDueDate || null,
        priority: taskPriority,
        notes: taskNotes,
      });
      const newTask = res.data.task;
      setTasks((current) => [newTask, ...current]);
      setTaskTitle("");
      setTaskPriority("medium");
      setTaskDueDate("");
      setTaskNotes("");
      toast.success("Task created");
      refreshStats();
    } catch (err) {
      toast.error(err.message || "Failed to create task");
    }
  }

  async function handleSaveProject(project) {
    const name = editingProjectName.trim();
    if (!name) return;

    try {
      const res = await api.projects.update(project.id, { name });
      const updated = res.data.project;
      setProjects((current) => current.map((p) => (p.id === project.id ? updated : p)));
      if (selectedProject?.id === project.id) setSelectedProject(updated);
      setEditingProjectId(null);
      toast.success("Project updated");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteProject(projectId) {
    if (!window.confirm("Delete this project?")) return;

    try {
      await api.projects.delete(projectId);
      setProjects((current) => current.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);
      toast.success("Project deleted");
      refreshStats();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleToggleTask(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const res = await api.tasks.update(taskId, { completed: !task.completed });
      const updated = res.data.task;
      setTasks((current) => current.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.tasks.delete(taskId);
      setTasks((current) => current.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
      refreshStats();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleCyclePriority(task) {
    const order = ["low", "medium", "high"];
    const currentIndex = order.indexOf(task.priority || "medium");
    const nextPriority = order[(currentIndex + 1) % order.length];

    try {
      const res = await api.tasks.update(task.id, { priority: nextPriority });
      const updated = res.data.task;
      setTasks((current) => current.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />

      <div className="bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-24 lg:px-8">
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
              <p className="mt-3 text-lg font-bold text-indigo-600">{planName}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
              <p className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats ? stats.tasks ?? 0 : 0}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Projects Section */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={handleCreateProject}
                placeholder="Create project and press Enter"
                className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-indigo-200 transition focus:ring-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
              <div className="mt-4 space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full rounded-2xl border p-4 text-left cursor-pointer transition ${
                      selectedProject?.id === project.id 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' 
                        : 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {editingProjectId === project.id ? (
                        <input
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveProject(project)}
                          onBlur={() => handleSaveProject(project)}
                          className="bg-transparent text-sm font-medium outline-none"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm font-medium">{project.name}</p>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Section */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={handleCreateTask}
                disabled={!selectedProject}
                placeholder={selectedProject ? "Add task and press Enter" : "Select a project first"}
                className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-indigo-200 transition focus:ring-4 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
              />
              <div className="mt-4 space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority || 'medium'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
