import { useEffect, useState } from "react"
import { Image } from "react-native"
import { student } from "../../types/students"

const StudentPhoto = ({
	student,
	style,
}: {
	student: student
	style?: any
}) => {
	const [url, setUrl] = useState<string | null>(null)
	const base_url = process.env.EXPO_PUBLIC_STORAGE_URL

	const gender = student.gender_alias === "gender_female" ? "girl" : "boy"

	useEffect(() => {
		const fetchPhoto = async (id: string) => {
			return fetch(`${base_url}/app/students/${id}.jpg`)
		}

		if (student.id) {
			fetchPhoto(student.id).then((response) => {
				if (response.ok) {
					setUrl(`${base_url}/app/students/${student.id}.jpg`)
				}
			})
		}
	}, [student])

	if (url !== null) {
		return <Image source={{ uri: url }} style={style || {}} />
	}

	return (
		<Image
			source={
				gender === "boy"
					? require("../../assets/boy-placeholder.png")
					: require("../../assets/girl-placeholder.png")
			}
			style={style || {}}
		/>
	)
}

export default StudentPhoto
