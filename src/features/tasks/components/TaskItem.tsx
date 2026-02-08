import React, { useState } from 'react';
import { Task } from '../../../types/task';
import { clsx } from 'clsx';
import { Check, Trash2, GripVertical, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    const addSubTask = useTaskStore((state) => state.addSubTask);
    const toggleSubTask = useTaskStore((state) => state.toggleSubTask);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 5 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const handleAddSubTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubTaskTitle.trim()) {
            addSubTask(task.id, newSubTaskTitle.trim());
            setNewSubTaskTitle('');
        }
    };

    // Calculate progress
    const completedSubTasks = task.subTasks.filter(st => st.completed).length;
    const totalSubTasks = task.subTasks.length;
    const progress = totalSubTasks === 0 ? 0 : (completedSubTasks / totalSubTasks) * 100;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            ref={setNodeRef}
            style={style}
            className={clsx(
                "group bg-surface rounded-xl p-3 shadow-sm border border-border transition-all pl-2 mb-2",
                task.status === 'done' && "opacity-60 bg-surface/50"
            )}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab text-muted hover:text-text active:cursor-grabbing touch-none p-1"
                >
                    <GripVertical size={16} />
                </div>

                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task.id)}
                    className={clsx(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                        task.status === 'done'
                            ? "bg-primary border-primary"
                            : "border-muted hover:border-primary"
                    )}
                >
                    {task.status === 'done' && <Check size={12} className="text-white" strokeWidth={4} />}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                    <p
                        className={clsx(
                            "text-sm font-medium leading-none transition-all duration-200",
                            task.status === 'done' ? "text-muted line-through" : "text-text"
                        )}
                    >
                        {task.title}
                    </p>
                    {task.description && (
                        <p className={clsx("truncate text-xs mt-0.5", task.status === 'done' ? "text-gray-600" : "text-muted")}>
                            {task.description}
                        </p>
                    )}

                    {/* Subtask Progress Bar */}
                    {totalSubTasks > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-muted">{completedSubTasks}/{totalSubTasks}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between mt-2 pl-9 pr-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors"
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {isExpanded ? 'Hide' : 'Show'} Subtasks
                </button>

                <button
                    onClick={() => onDelete(task.id)}
                    className="text-muted hover:text-red-400 transition-colors p-1"
                    aria-label="Delete task"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Subtasks Section */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-3 overflow-hidden"
                    >
                        <div className="space-y-1">
                            <AnimatePresence>
                                {task.subTasks.map((subTask) => (
                                    <motion.div
                                        key={subTask.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center gap-2 text-sm pl-1 py-1"
                                    >
                                        <button
                                            onClick={() => toggleSubTask(task.id, subTask.id)}
                                            className={clsx(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                subTask.completed ? "bg-primary border-primary" : "border-muted hover:border-primary"
                                            )}
                                        >
                                            {subTask.completed && <Check size={10} className="text-white" strokeWidth={4} />}
                                        </button>
                                        <span className={clsx("text-text transition-colors", subTask.completed && "line-through text-muted")}>
                                            {subTask.title}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Add Subtask Input */}
                        <form onSubmit={handleAddSubTask} className="flex items-center gap-2 mt-2 pb-1">
                            <Plus size={14} className="text-muted" />
                            <input
                                type="text"
                                value={newSubTaskTitle}
                                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                placeholder="Add subtask..."
                                className="bg-transparent text-sm text-text placeholder-muted focus:outline-none flex-1 min-w-0"
                            />
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
