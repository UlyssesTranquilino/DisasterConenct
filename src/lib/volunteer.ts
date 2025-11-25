export interface Assignment {
  id: number;
  title: string;
  organization: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Critical";
  location: string;
  coordinates: { lat: number; lng: number };
  requiredSkills: string[];
  estimatedHours: number;
  organizationContact: string;
  supplies?: string[];
}

export interface Mission {
  id: number;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  hoursCompleted: number;
  status: "Completed" | "Ongoing" | "Cancelled";
  skillsUsed: string[];
  feedback?: string;
}

export interface VolunteerMapProps {
  assignments: Assignment[];
  onAssignmentSelect: (assignment: Assignment) => void;
  selectedAssignment?: Assignment | null;
}