

export interface academic_year {
  id: string
  name: string
  starts_on: Date
}

export interface student {
  id: string
  last_name: string
  first_name: string
  middle_name?: string
  second_last_name?: string
  birthdate: Date
  gender_alias: "gender_male" | "gender_female"
  academic_year_classroom_students: {
    id: string
    classrooms: {
      id: string
      name: string
      academic_years?: academic_year
    }
  }[]
}

export interface StudentData {
  id: string
  first_name: string
  middle_name: string | null
  last_name: string
  birthdate: Date
  second_last_name: string | null
  name: string
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


export interface StudentProfileData {
  id: string
  migrated_id: number
  school_id: string
  first_name: string
  middle_name: string | null
  last_name: string
  second_last_name: string | null
  birthdate: string
  gender_alias: "gender_male" | "gender_female"
  created_at: string
  student_guardians: {
    student_id: string
    guardian_id: string
    relationship_type_alias: "guardian_mother" | "guardian_father" | "guardian_grandparent" | "guardian_other"
    is_primary: boolean
    notes: string | null
    created_at: string
    users: {
      id: string
      full_name: string
      email: string
    }
  }[]
  academic_year_classroom_students: {
    id: string
    classroom_id: string
    student_id: string
    created_at: string
    classrooms: {
      id: string
      academic_year_id: string
      grade_id: string
      name: string
      description: string | null
      capacity: number
      created_at: string
    }
    attendance_records: {
      id: string
      classroom_student_id: string
      date: string
      status_type: "attendance_status" | "meal_status" | "mood_status" | "poop_status" | "pee_status"
      status_value: string
      reason: string | null
      author_id: string
      created_at: string
    }[]
  }[]
}

export interface StudentStatusItems {
  alias: "meal_status" | "mood_status" | "poop_status" | "pee_status" | EatingStatus | MoodStatus | PoopStatus | PeeStatus
  description: string
}

export interface admin_classrooms {
  id: string;
  name: string;
  description: string | null;
  student_count: number;
  staff_count: number;
  attendance_count: number;
}