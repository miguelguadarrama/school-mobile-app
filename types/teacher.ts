import { StudentData } from "./students"


export interface ClassroomData {
  id: string
  name: string
  academic_year_id: string,
  academic_year_classroom_students: ({
    id: string
    student_id: string
  } & {
    attendance_records: {
      id: string
      status_type: string
      status_value: "attendance_status_present" | "attendance_status_absent" | "attendance_status_late"
      date: Date
    }[]
  } & {
    students: StudentData
  })[]
}