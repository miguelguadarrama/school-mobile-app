import React from "react"
import { Text, View, StyleSheet } from "react-native"
import { theme } from "../../helpers/theme"

type AvatarSize = "small" | "medium" | "large"
type AvatarVariant = "user" | "staff" | "primary"

interface AvatarProps {
	name: string
	size?: AvatarSize
	variant?: AvatarVariant
}

const sizeConfig = {
	small: { width: 32, height: 32, borderRadius: 16, fontSize: 12 },
	medium: { width: 40, height: 40, borderRadius: 20, fontSize: 14 },
	large: { width: 48, height: 48, borderRadius: 24, fontSize: theme.typography.size.lg },
}

const variantConfig = {
	user: { backgroundColor: theme.colors.primary, textColor: theme.colors.surface },
	staff: { backgroundColor: "#6b7280", textColor: theme.colors.surface },
	primary: { backgroundColor: theme.colors.primary, textColor: theme.colors.surface },
}

export const Avatar: React.FC<AvatarProps> = ({
	name,
	size = "medium",
	variant = "primary",
}) => {
	const sizeStyle = sizeConfig[size]
	const variantStyle = variantConfig[variant]

	const initial = name.charAt(0).toUpperCase()

	return (
		<View
			style={[
				styles.avatar,
				{
					width: sizeStyle.width,
					height: sizeStyle.height,
					borderRadius: sizeStyle.borderRadius,
					backgroundColor: variantStyle.backgroundColor,
				},
			]}
		>
			<Text
				style={[
					styles.avatarText,
					{
						fontSize: sizeStyle.fontSize,
						color: variantStyle.textColor,
					},
				]}
			>
				{initial}
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	avatar: {
		justifyContent: "center",
		alignItems: "center",
	},
	avatarText: {
		fontFamily: theme.typography.family.bold,
		fontWeight: "600",
	},
})