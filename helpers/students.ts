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