export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date | null;
    priority: Priority;
    status: TaskStatus;
    subTasks: SubTask[];
    createdAt: number;
}
