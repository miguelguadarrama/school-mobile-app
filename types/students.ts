

export interface student {
  id: string
  last_name: string
  first_name: string
  middle_name?: string
  second_last_name?: string
  academic_year_classroom_students: {
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

// Type definitions
export type EatingStatus = "none" | "little" | "normal" | "lots"
export type MoodStatus =
  | "happy"
  | "cuddly"
  | "tired"
  | "playful"
  | "sad"
  | "sick"

export interface DailyActivityData {
  eating: EatingStatus
  poop: boolean // true = had bowel movement, false = none
  mood: MoodStatus
}

export interface DailyActivityStatusProps {
  data: DailyActivityData
  childName?: string
}