import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { Plus } from 'lucide-react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';

export const TaskList: React.FC = () => {
    const tasks = useTaskStore((state) => state.tasks);
    const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
    const deleteTask = useTaskStore((state) => state.deleteTask);
    const addTask = useTaskStore((state) => state.addTask);
    const reorderTasks = useTaskStore((state) => state.reorderTasks);

    const [newTaskTitle, setNewTaskTitle] = React.useState('');

    const doneTasks = tasks.filter((t) => t.status === 'done');
    const todoTasks = tasks.filter((t) => t.status !== 'done');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Start dragging after moving 8px, good for mouse
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Long press for 250ms to drag on touch devices
                tolerance: 5,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = todoTasks.findIndex((t) => t.id === active.id);
            const newIndex = todoTasks.findIndex((t) => t.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newTodoTasks = arrayMove(todoTasks, oldIndex, newIndex);
                // Combine with done tasks (done tasks usually at the end or separate, but for store we need all)
                // Preserving the order of done tasks relative to each other, and keeping them separated from todo
                // Note: This logic assumes Todo items are always "above" Done items in the main array, or that order matters only within status groups.
                // Our store just takes the whole list.
                reorderTasks([...newTodoTasks, ...doneTasks]);
            }
        }
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask({ title: newTaskTitle, priority: 'medium', status: 'todo' });
        setNewTaskTitle('');
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6 pb-52">
            {/* Todo List - Draggable */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-text mb-2 px-1">Todo ({todoTasks.length})</h2>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={todoTasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2 min-h-[50px]">
                            <AnimatePresence mode='popLayout'>
                                {todoTasks.length === 0 && (
                                    <p className="text-muted italic text-center py-8 bg-surface/30 rounded-lg border border-border border-dashed">
                                        No tasks left! 🎉
                                    </p>
                                )}
                                {todoTasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={toggleTaskCompletion}
                                        onDelete={deleteTask}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Done List - Static */}
            {doneTasks.length > 0 && (
                <div className="space-y-2 pt-6 border-t border-border mt-6">
                    <h2 className="text-lg font-semibold text-muted mb-2 px-1">Completed ({doneTasks.length})</h2>
                    <div className="space-y-2 opacity-80">
                        <AnimatePresence mode='popLayout'>
                            {doneTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={toggleTaskCompletion}
                                    onDelete={deleteTask}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Add Task Input - Fixed Bottom */}
            <div className="fixed bottom-[84px] left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border z-20">
                <form onSubmit={handleAddTask} className="flex gap-2 max-w-md mx-auto">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="New Task..."
                        className="flex-1 bg-surface border-border border text-text rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none placeholder-muted shadow-sm"
                    />
                    <button
                        type="submit"
                        className="bg-primary hover:opacity-90 text-white p-3 rounded-lg transition-opacity shadow-sm"
                    >
                        <Plus size={24} />
                    </button>
                </form>
            </div>
        </div>
    );
};
