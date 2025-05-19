

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