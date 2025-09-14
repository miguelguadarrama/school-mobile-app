

export interface student {
  id: string
  last_name: string
  first_name: string
  middle_name?: string
  second_last_name?: string
  gender_alias: "gender_male" | "gender_female"
  academic_year_classroom_students: {
    id: string
    classrooms: {
      id: string
      name: string
      academic_years?: {
        id: string
        name: string
      }
    }
  }[]
}

export interface attendanceStatus {
  classroom_student_id: string
  date: string
  status_type: "attendance_status" | "meal_status" | "mood_status" | "poop_status" | "pee_status"
  status_value: string
  reason?: string
}

// Type definitions
export type PoopStatus = "poop_status_yes" | "poop_status_no"
export type PeeStatus = "pee_status_yes" | "pee_status_no"
export type EatingStatus = "meal_status_no" | "meal_status_little" | "meal_status_ok"
export type MoodStatus =
  | "mood_status_happy"
  | "mood_status_tired"
  | "mood_status_sad"
  | "mood_status_sick"

export interface DailyActivityData {
  eating: EatingStatus
  poop: PoopStatus // true = had bowel movement, false = none
  mood: MoodStatus
}

