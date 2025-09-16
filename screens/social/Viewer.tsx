// PhotoViewerScreen.tsx
import { Ionicons } from "@expo/vector-icons"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useRef, useState } from "react"
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	Share,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import {
	GestureHandlerRootView,
	Gesture,
	GestureDetector,
} from "react-native-gesture-handler"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	runOnJS,
} from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { BlogPostMedia } from "../../types/post"

export type SocialStackParamList = {
	Social: undefined
	PhotoGrid: {
		photos: BlogPostMedia[]
		title?: string
	}
	PhotoViewer: {
		photos: BlogPostMedia[]
		initialIndex: number
		title?: string
	}
}

type PhotoViewerScreenRouteProp = RouteProp<SocialStackParamList, "PhotoViewer">
type PhotoViewerScreenNavigationProp = NativeStackNavigationProp<
	SocialStackParamList,
	"PhotoViewer"
>

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const PhotoViewerScreen = () => {
	const route = useRoute<PhotoViewerScreenRouteProp>()
	const navigation = useNavigation<PhotoViewerScreenNavigationProp>()

	const { photos, initialIndex } = route.params
	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	const [isSharing, setIsSharing] = useState(false)
	const [imageLoading, setImageLoading] = useState(true)

	const translateX = useSharedValue(0)
	const opacity = useSharedValue(1)

	// Zoom and pan values for pinch-to-zoom functionality
	const scale = useSharedValue(1)
	const translateY = useSharedValue(0)
	const offsetX = useSharedValue(0)
	const offsetY = useSharedValue(0)

	const currentPhoto = photos[currentIndex] || photos[0] // Fallback to first photo if index is invalid

	const goToNextPhoto = () => {
		if (currentIndex < photos.length - 1) {
			const nextIndex = currentIndex + 1
			if (nextIndex < photos.length) {
				animateToNewPhoto(nextIndex, "left")
			}
		} else {
			returnToCenter()
		}
	}

	const goToPreviousPhoto = () => {
		if (currentIndex > 0) {
			const prevIndex = currentIndex - 1
			if (prevIndex >= 0) {
				animateToNewPhoto(prevIndex, "right")
			}
		} else {
			returnToCenter()
		}
	}

	const returnToCenter = () => {
		'worklet'
		translateX.value = withSpring(0)
		opacity.value = withSpring(1)
	}

	const resetZoom = () => {
		'worklet'
		scale.value = withSpring(1)
		translateY.value = withSpring(0)
		offsetX.value = withSpring(0)
		offsetY.value = withSpring(0)
	}

	const animateToNewPhoto = (newIndex: number, direction: "left" | "right") => {
		// Safety check: ensure newIndex is within bounds
		if (newIndex < 0 || newIndex >= photos.length) {
			returnToCenter()
			return
		}

		const toValue = direction === "left" ? -screenWidth : screenWidth
		const fromValue = direction === "left" ? screenWidth : -screenWidth

		// Reset zoom before changing photo
		resetZoom()

		// Animate current photo out
		translateX.value = withTiming(toValue, { duration: 250 }, () => {
			runOnJS(setCurrentIndex)(newIndex)
			runOnJS(setImageLoading)(true)
			translateX.value = fromValue
			// Animate new photo in
			translateX.value = withTiming(0, { duration: 250 })
		})
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
			const { translationX: gestureTranslationX, translationY } = event

			// If image is zoomed in, allow panning
			if (scale.value > 1) {
				offsetX.value = gestureTranslationX
				offsetY.value = translationY
				return
			}

			// Handle vertical swipe to close (only when not zoomed)
			if (Math.abs(translationY) > Math.abs(gestureTranslationX)) {
				// Vertical swipe is dominant - fade out the image
				const verticalProgress = Math.abs(translationY) / screenHeight
				opacity.value = Math.max(0.1, 1 - verticalProgress * 1.5)
				return
			}

			const isFirstPhoto = currentIndex === 0
			const isLastPhoto = currentIndex === photos.length - 1

			if (
				(isFirstPhoto && gestureTranslationX > 0) ||
				(isLastPhoto && gestureTranslationX < 0)
			) {
				// Stronger resistance at boundaries
				const resistance = 0.2 // Reduced from 0.3 for stronger resistance
				const limitedTranslation = gestureTranslationX * resistance
				translateX.value = limitedTranslation

				// Visual feedback: reduce opacity more significantly at boundaries
				const swipeProgress = Math.abs(limitedTranslation) / screenWidth
				opacity.value = Math.max(0.3, 1 - swipeProgress * 0.5) // Ensure minimum opacity of 0.3
				return
			}

			translateX.value = gestureTranslationX
			const swipeProgress = Math.abs(gestureTranslationX) / screenWidth
			opacity.value = 1 - swipeProgress * 0.3
		})
		.onEnd((event) => {
			const { translationX: gestureTranslationX, translationY, velocityX, velocityY } = event

			// If image is zoomed in, handle pan end differently
			if (scale.value > 1) {
				// Keep pan values but add some boundaries to prevent panning too far
				const maxPanX = (screenWidth * (scale.value - 1)) / 2
				const maxPanY = (screenHeight * (scale.value - 1)) / 2

				offsetX.value = withSpring(
					Math.max(-maxPanX, Math.min(maxPanX, gestureTranslationX))
				)
				offsetY.value = withSpring(
					Math.max(-maxPanY, Math.min(maxPanY, translationY))
				)
				return
			}

			const swipeThreshold = screenWidth * 0.25
			const velocityThreshold = 500
			const closeThreshold = screenWidth * 0.4 // Threshold to close viewer
			const strongVelocityThreshold = 1000 // Stronger velocity to close

			// Handle vertical swipe to close
			const verticalCloseThreshold = screenHeight * 0.2
			const verticalVelocityThreshold = 800
			const shouldCloseVertically =
				Math.abs(translationY) > verticalCloseThreshold ||
				Math.abs(velocityY) > verticalVelocityThreshold

			if (shouldCloseVertically && Math.abs(translationY) > Math.abs(gestureTranslationX)) {
				runOnJS(navigation.goBack)()
				return
			}

			const isFirstPhoto = currentIndex === 0
			const isLastPhoto = currentIndex === photos.length - 1

			const isSwipeRightValid = gestureTranslationX > swipeThreshold && !isFirstPhoto
			const isSwipeLeftValid = gestureTranslationX < -swipeThreshold && !isLastPhoto
			const isVelocityRightValid = velocityX > velocityThreshold && !isFirstPhoto
			const isVelocityLeftValid = velocityX < -velocityThreshold && !isLastPhoto

			// Check if user is trying to swipe beyond boundaries with enough force to close
			const shouldCloseOnSwipeLeft = isLastPhoto &&
				(gestureTranslationX < -closeThreshold || velocityX < -strongVelocityThreshold)
			const shouldCloseOnSwipeRight = isFirstPhoto &&
				(gestureTranslationX > closeThreshold || velocityX > strongVelocityThreshold)

			if (shouldCloseOnSwipeLeft || shouldCloseOnSwipeRight) {
				runOnJS(navigation.goBack)()
			} else if (isSwipeRightValid || isVelocityRightValid) {
				runOnJS(goToPreviousPhoto)()
			} else if (isSwipeLeftValid || isVelocityLeftValid) {
				runOnJS(goToNextPhoto)()
			} else {
				returnToCenter()
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
				{ translateX: translateX.value + offsetX.value },
				{ translateY: offsetY.value },
				{ scale: scale.value },
			],
			opacity: opacity.value,
		}
	})

	const handleGoBack = () => navigation.goBack()

	const shareImage = async () => {
		try {
			setIsSharing(true)

			if (!currentPhoto?.file_url) {
				Alert.alert("Error", "No se pudo encontrar la imagen para compartir.")
				return
			}

			// Get file extension from URL or default to jpg
			const fileExtension = currentPhoto.file_url.split('.').pop()?.toLowerCase() || 'jpg'
			const fileName = `photo_${Date.now()}.${fileExtension}`
			const fileUri = `${FileSystem.cacheDirectory}${fileName}`

			// Download the image to local storage using legacy API
			const downloadResult = await FileSystem.downloadAsync(
				currentPhoto.file_url,
				fileUri
			)

			if (!downloadResult.uri) {
				Alert.alert("Error", "No se pudo descargar la imagen.")
				return
			}

			// Check if sharing is available
			const isAvailable = await Sharing.isAvailableAsync()
			if (!isAvailable) {
				Alert.alert("Error", "La función de compartir no está disponible en este dispositivo.")
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

	const handleImageLoad = () => setImageLoading(false)
	const handleImageError = () => {
		setImageLoading(false)
		Alert.alert("Error", "Failed to load image")
	}

	return (
		<GestureHandlerRootView style={styles.container}>
			<StatusBar hidden />
			<SafeAreaView style={styles.topBar} edges={["top"]}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={handleGoBack}
					activeOpacity={0.7}
				>
					<Ionicons name="arrow-back" size={24} color="#fff" />
				</TouchableOpacity>
				<View style={styles.centerInfo}>
					<Text style={styles.photoCounter}>
						{currentIndex + 1} of {photos.length}
					</Text>
				</View>
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
			</SafeAreaView>

			<GestureDetector gesture={combinedGesture}>
				<Animated.View
					style={[styles.imageContainer, animatedStyle]}
				>
					{imageLoading && (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color="#fff" />
						</View>
					)}
					<Image
						source={{ uri: currentPhoto.file_url }}
						style={styles.fullScreenImage}
						resizeMode="contain"
						onLoad={handleImageLoad}
						onError={handleImageError}
					/>
				</Animated.View>
			</GestureDetector>

			{currentIndex > 0 && (
				<View style={[styles.swipeIndicator, styles.leftIndicator]}>
					<Ionicons
						name="chevron-back"
						size={30}
						color="rgba(255,255,255,0.7)"
					/>
				</View>
			)}
			{currentIndex < photos.length - 1 && (
				<View style={[styles.swipeIndicator, styles.rightIndicator]}>
					<Ionicons
						name="chevron-forward"
						size={30}
						color="rgba(255,255,255,0.7)"
					/>
				</View>
			)}
			{currentPhoto.caption && (
				<View style={styles.captionOverlay}>
					<SafeAreaView edges={["bottom"]}>
						<View style={styles.captionContainer}>
							<Ionicons
								name="chatbubble-outline"
								size={16}
								color="#fff"
								style={styles.captionIcon}
							/>
							<Text style={styles.captionText}>{currentPhoto.caption}</Text>
						</View>
					</SafeAreaView>
				</View>
			)}
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#000" },
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
	backButton: { padding: 8, marginLeft: -8 },
	centerInfo: { flex: 1, alignItems: "center" },
	photoCounter: { color: "#fff", fontSize: 16, fontWeight: "500" },
	shareButton: { padding: 8, marginRight: -8 },
	imageContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
	loadingContainer: {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: [{ translateX: -25 }, { translateY: -25 }],
		zIndex: 1,
	},
	fullScreenImage: { width: screenWidth, height: screenHeight },
	swipeIndicator: {
		position: "absolute",
		top: "50%",
		zIndex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		borderRadius: 20,
		padding: 8,
		transform: [{ translateY: -20 }],
	},
	leftIndicator: { left: 20 },
	rightIndicator: { right: 20 },
	captionOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		paddingBottom: 100,
	},
	captionContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	captionIcon: { marginRight: 8 },
	captionText: { flex: 1, color: "#fff", fontSize: 14, lineHeight: 20 },
})

export default PhotoViewerScreen
