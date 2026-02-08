import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task } from '../../../types/task';


interface TaskState {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'subTasks'>) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    toggleTaskCompletion: (id: string) => void;
    addSubTask: (taskId: string, title: string) => void;
    toggleSubTask: (taskId: string, subTaskId: string) => void;
    reorderTasks: (newOrder: Task[]) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            addTask: (taskData) => set((state) => ({
                tasks: [
                    ...state.tasks,
                    {
                        ...taskData,
                        id: crypto.randomUUID(),
                        createdAt: Date.now(),
                        subTasks: [],
                        status: 'todo', // Default
                    },
                ],
            })),
            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            })),
            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            })),
            toggleTaskCompletion: (id) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id
                        ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
                        : t
                ),
            })),
            addSubTask: (taskId, title) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === taskId
                        ? {
                            ...t,
                            subTasks: [
                                ...t.subTasks,
                                { id: crypto.randomUUID(), title, completed: false },
                            ],
                        }
                        : t
                ),
            })),
            toggleSubTask: (taskId, subTaskId) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === taskId
                        ? {
                            ...t,
                            subTasks: t.subTasks.map((st) =>
                                st.id === subTaskId ? { ...st, completed: !st.completed } : st
                            ),
                        }
                        : t
                ),
            })),
            reorderTasks: (newOrder) => set({ tasks: newOrder }),
        }),
        {
            name: 'task-storage',
            storage: createJSONStorage(() => localStorage), // Basic localStorage for now, can switch to localforage if needed for large data
        }
    )
);
