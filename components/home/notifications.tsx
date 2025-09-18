import { Ionicons } from "@expo/vector-icons"
import React from "react"
import {
	Alert,
	Linking,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { theme } from "../../helpers/theme"

interface ContactBarProps {
	// Contact props can be added here if needed
}

export default function ContactBar({}: ContactBarProps) {
	// Get environment variables
	const schoolPhone = process.env.EXPO_PUBLIC_SCHOOL_PHONE
	const schoolEmail = process.env.EXPO_PUBLIC_SCHOOL_EMAIL

	const handlePhoneCall = () => {
		if (!schoolPhone) {
			Alert.alert("Error", "Número de teléfono no disponible")
			return
		}

		Alert.alert(
			"Llamar al colegio",
			`¿Deseas llamar al colegio al número ${schoolPhone}?`,
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Llamar",
					onPress: () => {
						Linking.openURL(`tel:${schoolPhone}`)
					},
				},
			]
		)
	}

	const handleEmail = () => {
		if (!schoolEmail) {
			Alert.alert("Error", "Correo electrónico no disponible")
			return
		}

		Linking.openURL(`mailto:${schoolEmail}`)
	}

	const ContactItem = ({
		iconName,
		label,
		onPress,
	}: {
		iconName: keyof typeof Ionicons.glyphMap
		label: string
		onPress: () => void
	}) => (
		<TouchableOpacity style={styles.itemContainer} onPress={onPress}>
			<View style={styles.iconContainer}>
				<View style={styles.iconCircle}>
					<Ionicons name={iconName} size={22} color={theme.colors.primary} />
				</View>
			</View>
			<Text style={styles.label}>{label}</Text>
		</TouchableOpacity>
	)

	return (
		<View style={styles.outerContainer}>
			<Text style={styles.title}>Contacto</Text>
			<View style={styles.container}>
				<ContactItem
					iconName="call-outline"
					label="Teléfono"
					onPress={handlePhoneCall}
				/>

				<ContactItem
					iconName="mail-outline"
					label="Email"
					onPress={handleEmail}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	outerContainer: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		borderWidth: 1,
		borderColor: theme.colors.border,
		...theme.shadow.card,
	},
	title: {
		fontSize: theme.typography.size.md,
		fontWeight: "bold",
		color: theme.colors.text,
		textAlign: "center",
		paddingTop: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
		fontFamily: theme.typography.family.bold,
	},
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.lg,
		paddingBottom: theme.spacing.md,
	},
	itemContainer: {
		alignItems: "center",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		flex: 1,
	},
	iconContainer: {
		marginBottom: 6,
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
	},
	label: {
		fontSize: theme.typography.size.sm,
		fontWeight: "500",
		color: theme.colors.text,
		textAlign: "center",
		fontFamily: theme.typography.family.regular,
		marginTop: theme.spacing.xs,
	},
})
