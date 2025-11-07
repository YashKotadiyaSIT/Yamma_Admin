
export interface ProgressResponse {
  activityId: number;
  skillLevelId: number;
  createdDate: string;
  instructorName: string;
  daysAgo: number;
}

export interface SkillLevel {
  skillLevelId: number;
  description: string;
  colorCode: string; // Hex color code without '#'
}

export interface Activity {
  activityId: number;
  activityName: string;
}

export interface ProgressReportMasterDetail {
  skillLevels: SkillLevel[];
  activities: Activity[];
  studentProgress: ProgressResponse[];
  processedReport: ProcessedActivityReport[];
}

export interface ProcessedActivityReport {
  activityName: string;
  // A map where the key is the SkillLevel ID (1-5) and the value is a boolean (true if achieved/checked)
  skillLevelsAchieved: { [key: number]: boolean };
  // The actual highest level achieved
  highestSkillLevel: number;
}