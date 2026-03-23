import React, { useState } from 'react';
import { Task } from '../../../types/task';
import { clsx } from 'clsx';
import { Check, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    isOverlay?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, isOverlay }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);

    const addSubTask = useTaskStore((state) => state.addSubTask);
    const toggleSubTask = useTaskStore((state) => state.toggleSubTask);
    const deleteSubTask = useTaskStore((state) => state.deleteSubTask);
    const updateTask = useTaskStore((state) => state.updateTask);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = isOverlay ? {
        zIndex: 50,
        opacity: 1,
    } : {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 5 : 'auto',
        opacity: isDragging ? 0 : 1,
    };

    const handleAddSubTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubTaskTitle.trim()) {
            addSubTask(task.id, newSubTaskTitle.trim());
            setNewSubTaskTitle('');
        }
    };

    const handleSaveEdit = () => {
        if (editTitle.trim() && editTitle !== task.title) {
            updateTask(task.id, { title: editTitle.trim() });
        } else {
            setEditTitle(task.title);
        }
        setIsEditing(false);
    };

    // Calculate progress
    const completedSubTasks = task.subTasks.filter(st => st.completed).length;
    const totalSubTasks = task.subTasks.length;
    const progress = totalSubTasks === 0 ? 0 : (completedSubTasks / totalSubTasks) * 100;

    return (
        <div
            ref={isOverlay ? undefined : setNodeRef}
            style={style}
            {...(isOverlay ? {} : attributes)}
            {...(isOverlay ? {} : listeners)}
            className={clsx(
                "touch-manipulation outline-none",
                isDragging && !isOverlay && "z-10 relative",
                isOverlay && "z-50 relative"
            )}
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={clsx(
                    "group bg-surface rounded-xl p-3 shadow-sm border border-border transition-all pl-2 mb-2 cursor-grab active:cursor-grabbing",
                    task.status === 'done' && "opacity-60 bg-surface/50",
                    isOverlay && "shadow-2xl ring-2 ring-primary/50 cursor-grabbing rotate-2 scale-105"
                )}
            >
                <div
                    className="flex items-center gap-3 flex-1 min-w-0"
                >
                    {/* Checkbox */}
                    <button
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking checkbox
                        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                        className={clsx(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ml-1",
                            task.status === 'done'
                                ? "bg-primary border-primary"
                                : "border-muted active:border-primary md:hover:border-primary"
                        )}
                    >
                        {task.status === 'done' && <Check size={12} className="text-white" strokeWidth={4} />}
                    </button>

                    {/* Task Content */}
                    <div
                        className="flex-1 min-w-0"
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (task.status !== 'done') {
                                setIsEditing(true);
                                setEditTitle(task.title);
                            }
                        }}
                    >
                        {isEditing ? (
                            <input
                                autoFocus
                                value={editTitle}
                                onPointerDown={e => e.stopPropagation()}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleSaveEdit}
                                onKeyDown={(e) => {
                                    e.stopPropagation(); // Prevent dnd-kit from catching Space and Enter keys
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') {
                                        setEditTitle(task.title);
                                        setIsEditing(false);
                                    }
                                }}
                                className="bg-transparent text-sm font-medium leading-none text-text focus:outline-none w-full border-b border-primary"
                            />
                        ) : (
                            <p
                                className={clsx(
                                    "text-sm font-medium leading-snug transition-all duration-200 select-none break-words",
                                    task.status === 'done' ? "text-muted line-through" : "text-text"
                                )}
                            >
                                {task.title}
                            </p>
                        )}
                        {task.description && !isEditing && (
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
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs text-muted active:text-primary md:hover:text-primary transition-colors cursor-pointer"
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {isExpanded ? 'Hide' : 'Show'} Subtasks
                    </button>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onDelete(task.id)}
                        className="text-muted active:text-red-400 md:hover:text-red-400 transition-colors p-1 cursor-pointer"
                        aria-label="Delete task"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Subtasks Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            onPointerDown={(e) => e.stopPropagation()}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-3 overflow-hidden cursor-default"
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
                                                disabled={task.status === 'done'}
                                                onClick={() => toggleSubTask(task.id, subTask.id)}
                                                className={clsx(
                                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                    subTask.completed ? "bg-primary border-primary" : "border-muted active:border-primary md:hover:border-primary",
                                                    task.status === 'done' && "opacity-50 cursor-default"
                                                )}
                                            >
                                                {subTask.completed && <Check size={10} className="text-white" strokeWidth={4} />}
                                            </button>
                                            <span className={clsx("text-text transition-colors flex-1 break-words leading-snug", subTask.completed && "line-through text-muted")}>
                                                {subTask.title}
                                            </span>
                                            {task.status !== 'done' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteSubTask(task.id, subTask.id); }}
                                                    className="text-muted active:text-red-400 md:hover:text-red-400 opacity-100 md:opacity-0 md:group-hover/subtask:opacity-100 transition-opacity p-1 cursor-pointer"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Add Subtask Input */}
                            {task.status !== 'done' && (
                                <form onSubmit={handleAddSubTask} className="flex items-center gap-2 mt-2 pb-1">
                                    <Plus size={14} className="text-muted" />
                                    <input
                                        type="text"
                                        value={newSubTaskTitle}
                                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        placeholder="Add subtask..."
                                        className="bg-transparent text-sm text-text placeholder-muted focus:outline-none flex-1 min-w-0"
                                    />
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
