import { useContext } from "react"
import { Image } from "react-native"
import AppContext from "../../contexts/AppContext"
import { studentPhotoUri } from "../../helpers/students"
import { student } from "../../types/students"

const StudentPhoto = ({
	student,
	style,
}: {
	student: student
	style?: any
}) => {
	// const gender = student.gender_alias === "gender_female" ? "girl" : "boy"
	const { academic_year_id } = useContext(AppContext)!
	console.log({ academic_year_id })
	const student_photo_url = studentPhotoUri(academic_year_id, student.id)
	console.log({ student_photo_url })
	return <Image source={{ uri: student_photo_url }} style={style || {}} />
}

export default StudentPhoto
