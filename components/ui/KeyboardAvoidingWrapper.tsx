import React, { useMemo } from "react"
import {
	Dimensions,
	KeyboardAvoidingView,
	PixelRatio,
	Platform,
	ScrollView,
	StyleSheet,
} from "react-native"

interface KeyboardAvoidingWrapperProps {
	children: React.ReactNode
	style?: any
	behavior?: "height" | "position" | "padding"
	keyboardVerticalOffset?: number // If provided, overrides dynamic calculation
	enableScrollView?: boolean
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
	children,
	style,
	behavior = Platform.OS === "ios" ? "padding" : "height",
	keyboardVerticalOffset,
	enableScrollView = true,
}) => {
	// Calculate dynamic keyboard offset based on font scale and screen density
	const dynamicKeyboardOffset = useMemo(() => {
		if (keyboardVerticalOffset !== undefined) {
			return keyboardVerticalOffset // Use provided value if specified
		}

		const { fontScale, height } = Dimensions.get("window")
		const pixelDensity = PixelRatio.get()

		// Base offset values
		const baseOffset = Platform.OS === "ios" ? 0 : 25

		// Font scale adjustments
		let fontScaleMultiplier = 1
		if (fontScale > 1.3) {
			fontScaleMultiplier = 1.5 // Large font sizes need significant adjustment
		} else if (fontScale > 1.1) {
			fontScaleMultiplier = 1.2 // Medium font sizes need moderate adjustment
		} else {
			fontScaleMultiplier = 1 // Normal font sizes
		}

		// Pixel density adjustments for different screen types
		let densityAdjustment = 1
		if (pixelDensity > 3) {
			densityAdjustment = 1.3 // Very high density (iPhone Pro models, high-end Android)
		} else if (pixelDensity > 2.5) {
			densityAdjustment = 1.15 // High density (most modern phones)
		}

		// Screen height adjustment for smaller devices
		const heightAdjustment = height < 700 ? 1.2 : 1 // Smaller screens need more offset

		// Calculate final offset
		const calculatedOffset = baseOffset * fontScaleMultiplier * densityAdjustment * heightAdjustment

		return Math.round(Math.max(baseOffset, calculatedOffset))
	}, [keyboardVerticalOffset])

	// Calculate dynamic padding for ScrollView based on font scale
	const dynamicPadding = useMemo(() => {
		const { fontScale } = Dimensions.get("window")
		const basePadding = 20

		// More generous padding for larger font scales
		let paddingMultiplier = 1
		if (fontScale > 1.3) {
			paddingMultiplier = 2 // Large fonts need much more space
		} else if (fontScale > 1.1) {
			paddingMultiplier = 1.5 // Medium fonts need more space
		}

		return Math.round(basePadding * paddingMultiplier)
	}, [])
	const content = enableScrollView ? (
		<ScrollView
			contentContainerStyle={[
				styles.scrollContainer,
				{ paddingBottom: dynamicPadding }
			]}
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
			keyboardVerticalOffset={dynamicKeyboardOffset}
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
