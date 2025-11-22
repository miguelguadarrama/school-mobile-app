import { Ionicons } from "@expo/vector-icons"
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import React, { useState } from "react"
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	Modal,
	StatusBar,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native"
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler"
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

interface PhotoViewerModalProps {
	visible: boolean
	photoUrl: string
	onClose: () => void
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
	visible,
	photoUrl,
	onClose,
}) => {
	const [imageLoading, setImageLoading] = useState(true)
	const [isSharing, setIsSharing] = useState(false)

	// Zoom and pan values for pinch-to-zoom functionality
	const scale = useSharedValue(1)
	const translateY = useSharedValue(0)
	const offsetX = useSharedValue(0)
	const offsetY = useSharedValue(0)
	const opacity = useSharedValue(1)

	const resetZoom = () => {
		"worklet"
		scale.value = withSpring(1)
		translateY.value = withSpring(0)
		offsetX.value = withSpring(0)
		offsetY.value = withSpring(0)
		opacity.value = withSpring(1)
	}

	const handleClose = () => {
		resetZoom()
		setImageLoading(true)
		onClose()
	}

	const shareImage = async () => {
		try {
			setIsSharing(true)

			if (!photoUrl) {
				Alert.alert("Error", "No se pudo encontrar la imagen para compartir.")
				return
			}

			// Get file extension from URL or default to jpg
			const fileExtension = photoUrl.split(".").pop()?.toLowerCase() || "jpg"
			const fileName = `photo_${Date.now()}.${fileExtension}`
			const fileUri = `${FileSystem.cacheDirectory}${fileName}`

			// Download the image to local storage using legacy API
			const downloadResult = await FileSystem.downloadAsync(photoUrl, fileUri)

			if (!downloadResult.uri) {
				Alert.alert("Error", "No se pudo descargar la imagen.")
				return
			}

			// Check if sharing is available
			const isAvailable = await Sharing.isAvailableAsync()
			if (!isAvailable) {
				Alert.alert(
					"Error",
					"La función de compartir no está disponible en este dispositivo."
				)
				return
			}

			// Share the actual image file using expo-sharing
			await Sharing.shareAsync(downloadResult.uri, {
				mimeType: `image/${fileExtension}`,
				dialogTitle: "Compartir foto de la escuela",
			})

			console.log("Photo shared successfully")

			// Optional: Clean up the temporary file after sharing
			// Note: We don't await this to avoid blocking the UI
			FileSystem.deleteAsync(downloadResult.uri, { idempotent: true }).catch(
				(error) => console.warn("Failed to clean up temporary file:", error)
			)
		} catch (error) {
			console.error("Error sharing image:", error)
			Alert.alert("Error", "No se pudo compartir la foto. Inténtalo de nuevo.")
		} finally {
			setIsSharing(false)
		}
	}

	const pinchGesture = Gesture.Pinch()
		.onUpdate((event) => {
			scale.value = Math.max(1, Math.min(event.scale, 3)) // Limit scale between 1x and 3x
		})
		.onEnd(() => {
			// If scale is too close to 1, snap back to 1
			if (scale.value < 1.2) {
				scale.value = withSpring(1)
				offsetX.value = withSpring(0)
				offsetY.value = withSpring(0)
			}
		})

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			const { translationX, translationY } = event

			// If image is zoomed in, allow panning
			if (scale.value > 1) {
				offsetX.value = translationX
				offsetY.value = translationY
				return
			}

			// Handle vertical swipe to close (only when not zoomed)
			if (Math.abs(translationY) > Math.abs(translationX)) {
				// Vertical swipe is dominant - fade out the image
				const verticalProgress = Math.abs(translationY) / screenHeight
				opacity.value = Math.max(0.1, 1 - verticalProgress * 1.5)
				translateY.value = translationY
			}
		})
		.onEnd((event) => {
			const { translationY, velocityY } = event

			// If image is zoomed in, handle pan end differently
			if (scale.value > 1) {
				// Keep pan values but add some boundaries to prevent panning too far
				const maxPanX = (screenWidth * (scale.value - 1)) / 2
				const maxPanY = (screenHeight * (scale.value - 1)) / 2

				offsetX.value = withSpring(
					Math.max(-maxPanX, Math.min(maxPanX, event.translationX))
				)
				offsetY.value = withSpring(
					Math.max(-maxPanY, Math.min(maxPanY, translationY))
				)
				return
			}

			// Handle vertical swipe to close
			const verticalCloseThreshold = screenHeight * 0.2
			const verticalVelocityThreshold = 800
			const shouldCloseVertically =
				Math.abs(translationY) > verticalCloseThreshold ||
				Math.abs(velocityY) > verticalVelocityThreshold

			if (shouldCloseVertically) {
				runOnJS(handleClose)()
			} else {
				// Return to center
				opacity.value = withSpring(1)
				translateY.value = withSpring(0)
			}
		})

	// Double tap gesture for quick zoom in/out
	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			if (scale.value > 1) {
				// Zoom out
				scale.value = withSpring(1)
				offsetX.value = withSpring(0)
				offsetY.value = withSpring(0)
			} else {
				// Zoom in to 2x
				scale.value = withSpring(2)
			}
		})

	// Combine gestures - pinch, pan, and double tap can work together
	const combinedGesture = Gesture.Race(
		doubleTapGesture,
		Gesture.Simultaneous(pinchGesture, panGesture)
	)

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: offsetX.value },
				{ translateY: translateY.value + offsetY.value },
				{ scale: scale.value },
			],
			opacity: opacity.value,
		}
	})

	const handleImageLoad = () => setImageLoading(false)

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="fade"
			onRequestClose={handleClose}
		>
			<GestureHandlerRootView style={styles.container}>
				<StatusBar hidden />
				<SafeAreaView style={styles.topBar} edges={["top"]}>
					<View style={styles.spacer} />
					<TouchableOpacity
						style={styles.shareButton}
						onPress={shareImage}
						disabled={isSharing}
						activeOpacity={0.7}
					>
						{isSharing ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Ionicons name="share-outline" size={24} color="#fff" />
						)}
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={handleClose}
						activeOpacity={0.7}
					>
						<Ionicons name="close" size={28} color="#fff" />
					</TouchableOpacity>
				</SafeAreaView>

				<GestureDetector gesture={combinedGesture}>
					<Animated.View style={[styles.imageContainer, animatedStyle]}>
						{imageLoading && (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#fff" />
							</View>
						)}
						<Image
							source={{ uri: photoUrl }}
							style={styles.fullScreenImage}
							resizeMode="contain"
							onLoad={handleImageLoad}
						/>
					</Animated.View>
				</GestureDetector>
			</GestureHandlerRootView>
		</Modal>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	topBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	spacer: {
		flex: 1,
	},
	shareButton: {
		padding: 8,
		marginRight: 8,
	},
	closeButton: {
		padding: 8,
		marginRight: -8,
	},
	imageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingContainer: {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: [{ translateX: -25 }, { translateY: -25 }],
		zIndex: 1,
	},
	fullScreenImage: {
		width: screenWidth,
		height: screenHeight,
	},
})
