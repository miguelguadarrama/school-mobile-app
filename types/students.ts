

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

export interface StudentData {
  id: string
  first_name: string
  middle_name: string | null
  last_name: string
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


/* Student Profile Data Structure */
/*
{
  "id": "458d443e-f36b-1410-8a4f-0008f7e1d7fa",
  "migrated_id": 1539,
  "school_id": "3101433e-f36b-1410-8a38-0008f7e1d7fa",
  "first_name": "Isabel",
  "middle_name": "Carolina",
  "last_name": "Brito",
  "second_last_name": "Leal",
  "birthdate": "2023-06-14T00:00:00.000Z",
  "gender_alias": "gender_female",
  "created_at": "2025-04-01T08:04:04.000Z",
  "student_guardians": [
    {
      "student_id": "458d443e-f36b-1410-8a4f-0008f7e1d7fa",
      "guardian_id": "c77f443e-f36b-1410-8a4f-0008f7e1d7fa",
      "relationship_type_alias": "guardian_mother",
      "is_primary": false,
      "notes": null,
      "created_at": "2025-09-12T08:51:30.771Z",
      "users": {
        "id": "c77f443e-f36b-1410-8a4f-0008f7e1d7fa",
        "full_name": "SOREANGELA CAROLINA LEAL LOPEZ",
        "email": "soreangelaleal1@gmail.com"
      }
    },
    {
      "student_id": "458d443e-f36b-1410-8a4f-0008f7e1d7fa",
      "guardian_id": "cc7f443e-f36b-1410-8a4f-0008f7e1d7fa",
      "relationship_type_alias": "guardian_father",
      "is_primary": true,
      "notes": null,
      "created_at": "2025-09-12T08:51:30.781Z",
      "users": {
        "id": "cc7f443e-f36b-1410-8a4f-0008f7e1d7fa",
        "full_name": "HENRY DAVID BRITO CHIRINOS",
        "email": "henrytrabajando@gmail.com"
      }
    }
  ],
  "academic_year_classroom_students": [
    {
      "id": "d190433e-f36b-1410-8a50-0008f7e1d7fa",
      "classroom_id": "4f90443e-f36b-1410-8a4f-0008f7e1d7fa",
      "student_id": "458d443e-f36b-1410-8a4f-0008f7e1d7fa",
      "created_at": "2025-09-23T06:12:27.112Z",
      "classrooms": {
        "id": "4f90443e-f36b-1410-8a4f-0008f7e1d7fa",
        "academic_year_id": "688b443e-f36b-1410-8a4f-0008f7e1d7fa",
        "grade_id": "4a01433e-f36b-1410-8a38-0008f7e1d7fa",
        "name": "Sala de Maternal",
        "description": "Para niños de 2 años",
        "capacity": 21,
        "created_at": "2025-09-12T09:24:19.944Z"
      },
      "attendance_records": [
        {
          "id": "0694433e-f36b-1410-8a50-0008f7e1d7fa",
          "classroom_student_id": "d190433e-f36b-1410-8a50-0008f7e1d7fa",
          "date": "2025-09-28T00:00:00.000Z",
          "status_type": "meal_status",
          "status_value": "meal_status_ok",
          "reason": null,
          "author_id": "34af433e-f36b-1410-8a4f-0008f7e1d7fa",
          "created_at": "2025-09-28T15:20:21.375Z"
        },
        {
          "id": "0a94433e-f36b-1410-8a50-0008f7e1d7fa",
          "classroom_student_id": "d190433e-f36b-1410-8a50-0008f7e1d7fa",
          "date": "2025-09-28T00:00:00.000Z",
          "status_type": "mood_status",
          "status_value": "mood_status_happy",
          "reason": null,
          "author_id": "34af433e-f36b-1410-8a4f-0008f7e1d7fa",
          "created_at": "2025-09-28T15:20:21.375Z"
        },
        {
          "id": "0e94433e-f36b-1410-8a50-0008f7e1d7fa",
          "classroom_student_id": "d190433e-f36b-1410-8a50-0008f7e1d7fa",
          "date": "2025-09-28T00:00:00.000Z",
          "status_type": "pee_status",
          "status_value": "pee_status_yes",
          "reason": null,
          "author_id": "34af433e-f36b-1410-8a4f-0008f7e1d7fa",
          "created_at": "2025-09-28T15:20:21.375Z"
        },
        {
          "id": "1294433e-f36b-1410-8a50-0008f7e1d7fa",
          "classroom_student_id": "d190433e-f36b-1410-8a50-0008f7e1d7fa",
          "date": "2025-09-28T00:00:00.000Z",
          "status_type": "attendance_status",
          "status_value": "attendance_status_present",
          "reason": null,
          "author_id": "34af433e-f36b-1410-8a4f-0008f7e1d7fa",
          "created_at": "2025-09-28T15:20:21.375Z"
        },
        {
          "id": "1694433e-f36b-1410-8a50-0008f7e1d7fa",
          "classroom_student_id": "d190433e-f36b-1410-8a50-0008f7e1d7fa",
          "date": "2025-09-28T00:00:00.000Z",
          "status_type": "poop_status",
          "status_value": "poop_status_yes",
          "reason": null,
          "author_id": "34af433e-f36b-1410-8a4f-0008f7e1d7fa",
          "created_at": "2025-09-28T15:20:21.405Z"
        }
      ]
    }
  ]
}
*/

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
    relationship_type_alias: "guardian_mother" | "guardian_father" | "guardian_other"
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