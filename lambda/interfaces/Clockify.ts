export interface ClockifyUser {
    id: string;
    email: string;
    timeEntries?: ClockifyTimeEntry[];
};

export interface ClockifyTimeEntry {
    billable: boolean;
    description: string;
    id: string;
    isLocked: boolean;
    projectId: string;
    tagIds: string[];
    taskId: string;
    timeInterval: ClockifyTimeEntry
    userId: string;
    workspaceId: string;
};

export interface ClockifyTimeIntervall {
    duration: string;
    end: string;
    start: string;
};