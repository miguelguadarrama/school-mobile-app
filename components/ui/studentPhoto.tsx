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
	const [notFound, setNotFound] = useState(false)
	const base_url = process.env.EXPO_PUBLIC_STORAGE_URL

	const gender = student.gender_alias === "gender_female" ? "girl" : "boy"

	useEffect(() => {
		const fetchPhoto = async (id: string) => {
			return fetch(`${base_url}/app/students/${id}.jpg`)
		}

		if (student.id) {
			fetchPhoto(student.id)
				.then((response) => {
					if (response.ok) {
						setUrl(`${base_url}/app/students/${student.id}.jpg`)
					} else {
						setNotFound(true)
					}
				})
				.catch(() => {
					setNotFound(true)
				})
		}
	}, [student])

	if (notFound === true) {
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

	if (url === null) {
		return null
	}
	return <Image source={{ uri: url }} style={style || {}} />
}

export default StudentPhoto
