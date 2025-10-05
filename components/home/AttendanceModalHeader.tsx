import { LucideArrowLeft } from "lucide-react-native"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { theme } from "../../helpers/theme"

interface AttendanceModalHeaderProps {
	onBack: () => void
}

export const AttendanceModalHeader: React.FC<AttendanceModalHeaderProps> = ({
	onBack,
}) => {
	return (
		<View style={styles.header}>
			<TouchableOpacity onPress={onBack} style={styles.backButton}>
				<LucideArrowLeft size={24} color={theme.colors.text} />
			</TouchableOpacity>
			<Text style={styles.title}>Asistencia</Text>
			<View style={styles.placeholder} />
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: theme.spacing.xl,
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.md,
		backgroundColor: theme.colors.white,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backButton: {
		padding: theme.spacing.xs,
		width: 40,
	},
	title: {
		fontFamily: "Nunito_700Bold",
		fontSize: theme.typography.size.xl,
		color: theme.colors.text,
		flex: 1,
		textAlign: "center",
	},
	placeholder: {
		width: 40,
	},
})
