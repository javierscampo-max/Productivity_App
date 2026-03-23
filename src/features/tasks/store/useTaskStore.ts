import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from '../../../store/storage';
import { Task, SubTask } from '../../../types/task';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useCalendarStore } from '../../calendar/store/useCalendarStore';



interface TaskState {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'subTasks'>) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    toggleTaskCompletion: (id: string) => void;
    addSubTask: (taskId: string, title: string) => void;
    deleteSubTask: (taskId: string, subTaskId: string) => void;
    toggleSubTask: (taskId: string, subTaskId: string) => void;
    updateSubTask: (taskId: string, subTaskId: string, title: string) => void;
    reorderSubTasks: (taskId: string, newOrder: SubTask[]) => void;
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
            updateTask: (id, updates) => set((state) => {
                // Cross-store update if title changes
                if (updates.title) {
                    const calendarEvents = useCalendarStore.getState().events;
                    const linkedEvents = calendarEvents.filter(e => e.relatedTaskId === id);
                    linkedEvents.forEach(e => {
                        useCalendarStore.getState().updateEvent(e.id, { title: updates.title });
                    });
                }

                return {
                    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                };
            }),
            toggleTaskCompletion: (id) => set((state) => {
                const newState = state.tasks.map((t) => {
                    if (t.id === id) {
                        const newStatus = t.status === 'done' ? 'todo' : 'done';

                        // Handle subtasks auto-completion memory
                        let updatedSubTasks = t.subTasks;
                        if (newStatus === 'done') {
                            // Parent being marked done
                            updatedSubTasks = t.subTasks.map(st => ({
                                ...st,
                                completedBeforeParent: st.completed, // store original state
                                completed: true // force complete
                            }));
                        } else {
                            // Parent being marked undone
                            updatedSubTasks = t.subTasks.map(st => ({
                                ...st,
                                completed: st.completedBeforeParent !== undefined ? st.completedBeforeParent : st.completed, // restore original state
                                completedBeforeParent: undefined // clear memory
                            }));
                        }

                        // Cross-store sync: complete calendar event too
                        const { syncCalendarEventToTask } = useSettingsStore.getState();
                        if (syncCalendarEventToTask) {
                            const calendarEvents = useCalendarStore.getState().events;
                            const linkedEvents = calendarEvents.filter(e => e.relatedTaskId === id);
                            linkedEvents.forEach(e => {
                                useCalendarStore.getState().updateEvent(e.id, { completed: newStatus === 'done' });
                            });
                        }

                        return { ...t, status: newStatus as any, subTasks: updatedSubTasks };
                    }
                    return t;
                });
                return { tasks: newState };
            }),
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
            deleteSubTask: (taskId, subTaskId) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === taskId
                        ? { ...t, subTasks: t.subTasks.filter((st) => st.id !== subTaskId) }
                        : t
                ),
            })),
            toggleSubTask: (taskId, subTaskId) => set((state) => {
                const newState = state.tasks.map((t) => {
                    if (t.id === taskId) {
                        const updatedSubTasks = t.subTasks.map((st) =>
                            st.id === subTaskId ? { ...st, completed: !st.completed } : st
                        );

                        let updatedStatus = t.status;
                        const { autoCompleteParentTask } = useSettingsStore.getState();

                        if (autoCompleteParentTask && updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.completed)) {
                            updatedStatus = 'done';
                            
                            // Mark the exact subtask that caused this auto-completion so it unchecks if the parent is reverted
                            const causingSubtask = updatedSubTasks.find(st => st.id === subTaskId);
                            if (causingSubtask && causingSubtask.completed) {
                                causingSubtask.completedBeforeParent = false;
                            }
                        }

                        return {
                            ...t,
                            status: updatedStatus,
                            subTasks: updatedSubTasks,
                        };
                    }
                    return t;
                });
                return { tasks: newState };
            }),
            updateSubTask: (taskId, subTaskId, title) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === taskId
                        ? {
                            ...t,
                            subTasks: t.subTasks.map((st) =>
                                st.id === subTaskId ? { ...st, title } : st
                            )
                        }
                        : t
                ),
            })),
            reorderSubTasks: (taskId, newOrder) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === taskId ? { ...t, subTasks: newOrder } : t
                ),
            })),
            reorderTasks: (newOrder) => set({ tasks: newOrder }),
        }),
        {
            name: 'task-storage',
            storage: createJSONStorage(() => asyncStorage),
        }
    )
);
