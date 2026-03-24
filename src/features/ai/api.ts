import { FunctionDeclaration, SchemaType, FunctionCall } from "@google/generative-ai";
import { useTaskStore } from '../tasks/store/useTaskStore';
import { useCalendarStore } from '../calendar/store/useCalendarStore';

export const aiTools: FunctionDeclaration[] = [
    {
        name: "createTask",
        description: "Creates a new task in the user's master to-do list. Optionally includes subtasks.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                title: { type: SchemaType.STRING, description: "The title/name of the task." },
                subtasks: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "Optional array of string titles to automatically generate subtasks."
                }
            },
            required: ["title"]
        }
    },
    {
        name: "createCalendarEvent",
        description: "Schedules an event on a specific date in the calendar.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                title: { type: SchemaType.STRING, description: "The title of the scheduled event." },
                date: { type: SchemaType.STRING, description: "The exact date of the event in YYYY-MM-DD format." }
            },
            required: ["title", "date"]
        }
    },
    {
        name: "getUserData",
        description: "Retrieves the user's active tasks and calendar events so you can read exactly what they have planned and currently hanging in their to-do list.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                includeTasks: { type: SchemaType.BOOLEAN },
                includeEvents: { type: SchemaType.BOOLEAN }
            },
            required: ["includeTasks", "includeEvents"]
        }
    }
];

export const executeAiTool = async (functionCall: FunctionCall): Promise<any> => {
    const { name } = functionCall;
    const args = (functionCall.args || {}) as Record<string, any>;
    const taskStore = useTaskStore.getState();
    const calendarStore = useCalendarStore.getState();

    if (name === 'createTask') {
        const title = args.title as string;
        const subtasks = args.subtasks as string[] | undefined;
        
        // Add task
        taskStore.addTask({ title, status: 'todo', priority: 'medium' });
        
        // Find the newly added task reliably since it pushes to the end
        const tasks = useTaskStore.getState().tasks;
        const newlyAdded = tasks[tasks.length - 1];
        
        if (subtasks && subtasks.length > 0 && newlyAdded) {
            subtasks.forEach(st => {
                useTaskStore.getState().addSubTask(newlyAdded.id, st);
            });
        }
        return { success: true, message: `Task '${title}' created successfully.` };
    }

    if (name === 'createCalendarEvent') {
        const title = args.title as string;
        const dateStr = args.date as string;
        const parsedDate = new Date(dateStr);
        calendarStore.addEvent({
            title,
            startDate: parsedDate,
            endDate: parsedDate,
            isAllDay: true,
            type: 'normal'
        });
        return { success: true, message: `Event '${title}' scheduled for ${dateStr}.` };
    }

    if (name === 'getUserData') {
        const result: any = {};
        if (args.includeTasks) {
            result.tasks = taskStore.tasks.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                subTasks: t.subTasks.map(st => ({ title: st.title, status: st.completed ? 'done' : 'todo' }))
            }));
        }
        if (args.includeEvents) {
            result.events = calendarStore.events.map(e => ({
                id: e.id,
                title: e.title,
                date: e.startDate.toISOString().split('T')[0],
                type: e.type
            }));
        }
        return result;
    }

    return { success: false, error: `Unknown tool: ${name}` };
};
