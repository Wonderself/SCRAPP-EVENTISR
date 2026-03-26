export interface Task {
  id: number;
  description: string;
  type: "recurring" | "one_time";
  priority: "normal" | "urgent";
  date: string | null;
  time: string | null;
  days_of_week: string[] | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: number;
  task_id: number;
  completed_date: string;
  completed_at: string;
}

export interface Conversation {
  id: number;
  source: "whatsapp" | "web";
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DayTasks {
  date: string;
  dayName: string;
  dayShort: string;
  tasks: (Task & { completed: boolean })[];
}
