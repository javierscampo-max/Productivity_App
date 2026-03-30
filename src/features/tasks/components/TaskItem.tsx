import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Task } from '../../../types/task';
import { clsx } from 'clsx';
import { Check, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { SubTask } from '../../../types/task';

// --- Subtask Component ---
const SubTaskRow: React.FC<{
    subTask: SubTask;
    task: Task;
    toggleSubTask: (taskId: string, subTaskId: string) => void;
    deleteSubTask: (taskId: string, subTaskId: string) => void;
    updateSubTask: (taskId: string, subTaskId: string, title: string) => void;
}> = ({ subTask, task, toggleSubTask, deleteSubTask, updateSubTask }) => {
    const controls = useDragControls();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(subTask.title);

    const handleSaveEdit = () => {
        if (editTitle.trim() && editTitle !== subTask.title) {
            updateSubTask(task.id, subTask.id, editTitle.trim());
        } else {
            setEditTitle(subTask.title);
        }
        setIsEditing(false);
    };

    return (
        <Reorder.Item
            value={subTask}
            dragListener={false}
            dragControls={controls}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={clsx(
                "flex items-center gap-2 text-sm pl-1 py-1 pr-2 relative group/subtask bg-surface rounded select-none touch-none",
                !subTask.completed && task.status !== 'done' && "cursor-grab active:cursor-grabbing"
            )}
            onPointerDown={(e) => {
                // Clicking anywhere starts the drag, unless children stopPropagation
                if (!subTask.completed && task.status !== 'done') {
                    controls.start(e);
                }
            }}
        >
            <button
                disabled={task.status === 'done'}
                onPointerDown={(e) => e.stopPropagation()} // Prevent dragging from checkbox
                onClick={() => toggleSubTask(task.id, subTask.id)}
                className={clsx(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                    subTask.completed ? "bg-primary border-primary" : "border-muted active:border-primary md:hover:border-primary",
                    task.status === 'done' && "opacity-50 cursor-default"
                )}
            >
                {subTask.completed && <Check size={10} className="text-white" strokeWidth={4} />}
            </button>
            <div 
                className="flex-1 min-w-0"
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!subTask.completed && task.status !== 'done') {
                        setIsEditing(true);
                        setEditTitle(subTask.title);
                    }
                }}
            >
                {isEditing ? (
                    <input
                        autoFocus
                        value={editTitle}
                        onPointerDown={e => e.stopPropagation()} // Prevent drag inside input
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') {
                                setEditTitle(subTask.title);
                                setIsEditing(false);
                            }
                        }}
                        className="bg-transparent text-sm leading-snug text-text focus:outline-none w-full border-b border-primary"
                    />
                ) : (
                    <span className={clsx("text-text transition-colors block break-words leading-snug select-none", subTask.completed && "line-through text-muted")}>
                        {subTask.title}
                    </span>
                )}
            </div>
            {task.status !== 'done' && (
                <button
                    onPointerDown={(e) => e.stopPropagation()} // Prevent dragging from delete button
                    onClick={(e) => { e.stopPropagation(); deleteSubTask(task.id, subTask.id); }}
                    className="text-muted active:text-red-400 md:hover:text-red-400 opacity-100 md:opacity-0 md:group-hover/subtask:opacity-100 transition-opacity p-1 cursor-pointer shrink-0"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </Reorder.Item>
    );
};
// -------------------------

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

    const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const subtaskInputRef = React.useRef<HTMLInputElement>(null);

    const addSubTask = useTaskStore((state) => state.addSubTask);
    const toggleSubTask = useTaskStore((state) => state.toggleSubTask);
    const deleteSubTask = useTaskStore((state) => state.deleteSubTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const updateSubTask = useTaskStore((state) => state.updateSubTask);
    const reorderSubTasks = useTaskStore((state) => state.reorderSubTasks);

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

    const handleTaskInteraction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (task.status === 'done') return;

        if (clickTimeoutRef.current) {
            // Double tap detected -> Open subtasks and focus synchronously
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            flushSync(() => {
                setIsExpanded(true);
            });
            subtaskInputRef.current?.focus();
        } else {
            // Single tap -> wait to see if it's a double tap, otherwise edit
            clickTimeoutRef.current = setTimeout(() => {
                clickTimeoutRef.current = null;
                setIsEditing(true);
                setEditTitle(task.title);
            }, 250);
        }
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

    const sortedSubTasks = [...task.subTasks].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

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
                    "group bg-surface rounded-xl shadow-sm border border-border transition-all pl-2 mb-2 cursor-grab active:cursor-grabbing",
                    totalSubTasks === 0 ? "py-4 px-3" : "p-3",
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
                        onClick={handleTaskInteraction}
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
                            <p className={clsx("truncate text-xs mt-0.5 select-none", task.status === 'done' ? "text-gray-600" : "text-muted")}>
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

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onDelete(task.id)}
                        className="text-muted active:text-red-400 md:hover:text-red-400 transition-colors p-1 cursor-pointer shrink-0"
                        aria-label="Delete task"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Actions Row */}
                {totalSubTasks > 0 && (
                    <div className="flex items-center justify-between mt-2 pl-9 pr-2">
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 text-xs text-muted active:text-primary md:hover:text-primary transition-colors cursor-pointer select-none"
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {isExpanded ? 'Hide' : 'Show'} Subtasks
                        </button>
                    </div>
                )}

                {/* Subtasks Section */}
                <motion.div
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                    className={clsx(
                        "ml-8 space-y-2 border-l-2 border-border pl-3 overflow-hidden cursor-default",
                        isExpanded ? "mt-2 pt-1 pb-1" : "pointer-events-none"
                    )}
                >
                    <div className="space-y-1">
                                <AnimatePresence>
                                    <Reorder.Group
                                        axis="y"
                                        values={sortedSubTasks}
                                        onReorder={(newOrder) => reorderSubTasks(task.id, newOrder)}
                                        className="space-y-1"
                                    >
                                        {sortedSubTasks.map((subTask) => (
                                            <SubTaskRow
                                                key={subTask.id}
                                                subTask={subTask}
                                                task={task}
                                                toggleSubTask={toggleSubTask}
                                                deleteSubTask={deleteSubTask}
                                                updateSubTask={updateSubTask}
                                            />
                                        ))}
                                    </Reorder.Group>
                                </AnimatePresence>
                            </div>

                            {/* Add Subtask Input */}
                            {task.status !== 'done' && (
                                <form onSubmit={handleAddSubTask} className="flex items-center gap-2 mt-2 pb-1">
                                    <Plus size={14} className="text-muted" />
                                    <input
                                        ref={subtaskInputRef}
                                        type="text"
                                        value={newSubTaskTitle}
                                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onBlur={(e) => {
                                            if (!e.target.value.trim() && totalSubTasks === 0) {
                                                setIsExpanded(false);
                                            }
                                        }}
                                        placeholder="Add subtask..."
                                        className="bg-transparent text-sm text-text placeholder-muted focus:outline-none flex-1 min-w-0"
                                    />
                                </form>
                            )}
                </motion.div>
            </motion.div>
        </div>
    );
};
