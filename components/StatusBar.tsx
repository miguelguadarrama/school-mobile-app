import React, { useContext, useEffect, useState } from "react"
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/AuthContext"
import AppContext from "../contexts/AppContext"
import { student } from "../types/students"
import { displayName } from "../helpers/students"

interface Student {
	id: number
	name: string
	classroom: string
	photo: string
}

const StatusBar: React.FC = () => {
	const { logout } = useAuth()
	const { students, selectedStudent, setSelectedStudent } =
		useContext(AppContext)!
	const [modalVisible, setModalVisible] = useState(false)

	useEffect(() => {
		if (selectedStudent === null && students.length) {
			setSelectedStudent(students[0])
		}
	}, [students])

	const toggleModal = () => {
		setModalVisible(!modalVisible)
	}

	if (!selectedStudent) {
		return null
	}

	return (
		<>
			<View style={styles.container}>
				<TouchableOpacity onPress={toggleModal} style={styles.profileContainer}>
					<Image
						source={{ uri: "https://placehold.co/150" }}
						style={styles.profileImage}
					/>
					<View>
						<Text style={styles.name}>{displayName(selectedStudent)}</Text>
						<Text style={styles.classroom}>
							{selectedStudent.academic_year_classroom_students?.[0]?.classrooms
								?.name || ""}
						</Text>
					</View>
					<Ionicons
						name="chevron-down"
						size={18}
						color="black"
						style={styles.chevronDown}
					/>
				</TouchableOpacity>
			</View>

			<Modal visible={modalVisible} animationType="fade" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Image
							source={{
								uri: "https://placehold.co/150",
							}}
							style={styles.modalImage}
						/>
						<Text style={styles.modalName}>{displayName(selectedStudent)}</Text>

						<TouchableOpacity style={styles.editButton} onPress={toggleModal}>
							<Ionicons name="close-outline" size={24} color="black" />
						</TouchableOpacity>

						{students.length > 1 && (
							<>
								<Text style={styles.sectionTitle}>Switch Profile</Text>
								{students.map((s) => (
									<TouchableOpacity
										style={styles.profileOption}
										key={s.id}
										onPress={() => {
											setSelectedStudent(s)
											toggleModal()
										}}
									>
										<Text>{displayName(s)}</Text>
									</TouchableOpacity>
								))}
							</>
						)}

						<TouchableOpacity
							style={styles.signoutButton}
							onPress={() => logout()}
						>
							<Text style={styles.signoutText}>Cerrar Sesión</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	chevronDown: {
		marginTop: 5,
		marginLeft: 5,
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 10,
		backgroundColor: "#F0F0F0",
	},
	profileContainer: {
		flexDirection: "row",
		alignItems: "stretch",
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
		backgroundColor: "#CCC",
	},
	name: {
		fontFamily: "Nunito_700Bold",
		fontSize: 16,
		fontWeight: "bold",
	},
	classroom: {
		fontFamily: "Nunito_400Regular",
		fontSize: 14,
		color: "#777",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		width: 300,
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		alignItems: "center",
	},
	modalImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 12,
		backgroundColor: "#CCC",
	},
	modalName: {
		fontFamily: "Nunito_700Bold",
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	editButton: {
		position: "absolute",
		top: 10,
		right: 10,
	},
	sectionTitle: {
		fontFamily: "Nunito_400Regular",
		fontSize: 16,
		fontWeight: "bold",
		marginVertical: 8,
	},
	profileOption: {
		padding: 10,
	},
	signoutButton: {
		marginTop: 20,
		padding: 10,
		backgroundColor: "#ff6b6b",
		borderRadius: 5,
	},
	signoutText: {
		fontFamily: "Nunito_700Bold",
		color: "#fff",
		fontWeight: "bold",
	},
	closeButton: {
		marginTop: 10,
	},
})

export default StatusBar
