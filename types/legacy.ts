export interface L_Student {
  id: number
  nombre: string
  apellido: string
  "2donombre": string
  "2doapellido": string
  fechanac: Date
  sexo: boolean
}

export interface L_Guardian {
  id: number
  rif: string
  parentesco: string
  paga?: boolean
  nombre: string
  apellido: string
  telefono: string
}

export interface L_Census {
  id: number
  id_alumno: number
  id_status: number
  id_anoescolar: number
  fecha: Date
  modificado?: Date
  alumno: L_Student
  madre: L_Guardian
  padre: L_Guardian
}
