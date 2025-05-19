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
	const { students } = useContext(AppContext)!
	const [student, setStudent] = useState<student | null>(null)
	const [modalVisible, setModalVisible] = useState(false)

	useEffect(() => {
		if (student === null && students.length) {
			setStudent(students[0])
		}
	}, [students])

	const toggleModal = () => {
		setModalVisible(!modalVisible)
	}

	if (!student) {
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
						<Text style={styles.name}>{displayName(student)}</Text>
						<Text style={styles.classroom}>
							{student.academic_year_classroom_students?.[0]?.classrooms
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

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Image
							source={{
								uri: "https://via.placeholder.com/150",
							}}
							style={styles.modalImage}
						/>
						<Text style={styles.modalName}>{displayName(student)}</Text>
						<TouchableOpacity style={styles.editButton}>
							<Ionicons name="create-outline" size={24} color="black" />
						</TouchableOpacity>

						{students.length > 1 && (
							<>
								<Text style={styles.sectionTitle}>Switch Profile</Text>
								{students.map((s) => (
									<TouchableOpacity style={styles.profileOption}>
										<Text>{displayName(s)}</Text>
									</TouchableOpacity>
								))}
							</>
						)}

						<TouchableOpacity
							style={styles.signoutButton}
							onPress={() => logout()}
						>
							<Text style={styles.signoutText}>Sign Out</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
							<Text>Close</Text>
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
		fontSize: 16,
		fontWeight: "bold",
	},
	classroom: {
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
	},
	modalName: {
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
		color: "#fff",
		fontWeight: "bold",
	},
	closeButton: {
		marginTop: 10,
	},
})

export default StatusBar
