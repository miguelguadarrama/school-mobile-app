import { Image, StyleSheet, Text, View } from "react-native"
import { theme } from "../../helpers/theme"

const JAC_H_Logo = () => {
	return (
		<View style={styles.schoolHeader}>
			<Image
				source={require("../../assets/icon.png")}
				style={styles.schoolLogo}
			/>
			<Text style={styles.schoolName}>
				{process.env.EXPO_PUBLIC_SCHOOL_NAME}
			</Text>
		</View>
	)
}

export default JAC_H_Logo

const styles = StyleSheet.create({
	schoolHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: theme.spacing.sm,
		paddingHorizontal: theme.spacing.sm,
	},
	schoolLogo: {
		width: 48,
		height: 48,
		marginRight: 0,
	},
	schoolName: {
		fontSize: theme.typography.size.lg,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
	},
})
