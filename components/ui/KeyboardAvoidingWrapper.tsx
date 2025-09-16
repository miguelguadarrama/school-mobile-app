import React from "react"
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
} from "react-native"

interface KeyboardAvoidingWrapperProps {
	children: React.ReactNode
	style?: any
	behavior?: "height" | "position" | "padding"
	keyboardVerticalOffset?: number
	enableScrollView?: boolean
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
	children,
	style,
	behavior = Platform.OS === "ios" ? "padding" : "height",
	keyboardVerticalOffset = Platform.OS === "ios" ? 0 : 25,
	enableScrollView = true,
}) => {
	const content = enableScrollView ? (
		<ScrollView
			contentContainerStyle={[styles.scrollContainer, { paddingBottom: 20 }]}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	) : (
		children
	)

	return (
		<KeyboardAvoidingView
			style={[styles.container, style]}
			behavior={behavior}
			keyboardVerticalOffset={keyboardVerticalOffset}
		>
			{content}
		</KeyboardAvoidingView>
	)
}

export default KeyboardAvoidingWrapper

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContainer: {
		flexGrow: 1,
	},
})
