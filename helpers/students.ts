import { student } from "../types/students";


export const displayName = (student: student) => {
  let name = student.first_name;
  if (student.middle_name) {
    name += ` ${student.middle_name[0]}.`
  }
  name += ` ${student.last_name}`
  if (student.second_last_name) {
    name += ` ${student.second_last_name[0]}.`
  }
  return name
}

export const displayShortName = (student: student) => {
  let name = student.last_name
  if (student.second_last_name) {
    name += ` ${student.second_last_name[0]}.`
  }
  name += ` ${student.first_name}`
  if (student.middle_name) {
    name += ` ${student.middle_name[0]}.`
  }
  return name
}

export const studentPhotoUri = (academic_year_id: string | undefined, student_id: string) => {
  return `${process.env.EXPO_PUBLIC_API_BASE_URL.replace(
    "/api",
    ""
  )}/blob/students/${academic_year_id}/${student_id}.jpg`
}