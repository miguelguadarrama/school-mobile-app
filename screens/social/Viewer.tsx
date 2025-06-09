// PhotoViewerScreen.tsx
import React, { useState, useRef } from "react"
import {
	View,
	Image,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	StatusBar,
	Text,
	Animated,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import * as MediaLibrary from "expo-media-library"
import * as FileSystem from "expo-file-system"
import { SafeAreaView } from "react-native-safe-area-context"
import {
	PanGestureHandler,
	GestureHandlerRootView,
	State,
	PanGestureHandlerGestureEvent,
	PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler"
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
	const [isDownloading, setIsDownloading] = useState(false)
	const [imageLoading, setImageLoading] = useState(true)

	const translateX = useRef(new Animated.Value(0)).current
	const opacity = useRef(new Animated.Value(1)).current

	const currentPhoto = photos[currentIndex]
	const translationValue = useRef(0)

	const onGestureEvent = Animated.event(
		[{ nativeEvent: { translationX: translateX } }],
		{
			useNativeDriver: true,
			listener: (event: PanGestureHandlerGestureEvent) => {
				const { translationX } = event.nativeEvent
				const isFirstPhoto = currentIndex === 0
				const isLastPhoto = currentIndex === photos.length - 1

				if (
					(isFirstPhoto && translationX > 0) ||
					(isLastPhoto && translationX < 0)
				) {
					const resistance = 0.3
					const limitedTranslation = translationX * resistance
					translationValue.current = limitedTranslation

					const swipeProgress = Math.abs(limitedTranslation) / screenWidth
					opacity.setValue(1 - swipeProgress * 0.15)

					translateX.setValue(limitedTranslation)
					return
				}

				translationValue.current = translationX
				const swipeProgress = Math.abs(translationValue.current) / screenWidth
				opacity.setValue(1 - swipeProgress * 0.3)
			},
		}
	)

	const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
		const { state, translationX, velocityX } = event.nativeEvent

		if (state === State.END) {
			const swipeThreshold = screenWidth * 0.25
			const velocityThreshold = 500

			const isFirstPhoto = currentIndex === 0
			const isLastPhoto = currentIndex === photos.length - 1

			const isSwipeRightValid = translationX > swipeThreshold && !isFirstPhoto
			const isSwipeLeftValid = translationX < -swipeThreshold && !isLastPhoto
			const isVelocityRightValid =
				velocityX > velocityThreshold && !isFirstPhoto
			const isVelocityLeftValid = velocityX < -velocityThreshold && !isLastPhoto

			const tryingToSwipeLeftButAtLast = translationX < 0 && isLastPhoto
			const tryingToSwipeRightButAtFirst = translationX > 0 && isFirstPhoto

			if (isSwipeRightValid || isVelocityRightValid) {
				goToPreviousPhoto()
			} else if (isSwipeLeftValid || isVelocityLeftValid) {
				goToNextPhoto()
			} else {
				// Always return to center if no transition
				returnToCenter()
			}
		}
	}

	const goToNextPhoto = () => {
		if (currentIndex < photos.length - 1) {
			animateToNewPhoto(currentIndex + 1, "left")
		} else {
			returnToCenter()
		}
	}

	const goToPreviousPhoto = () => {
		if (currentIndex > 0) {
			animateToNewPhoto(currentIndex - 1, "right")
		} else {
			returnToCenter()
		}
	}

	const animateToNewPhoto = (newIndex: number, direction: "left" | "right") => {
		const toValue = direction === "left" ? -screenWidth : screenWidth
		const fromValue = direction === "left" ? screenWidth : -screenWidth

		// Animate current photo out
		Animated.timing(translateX, {
			toValue,
			duration: 250,
			useNativeDriver: true,
		}).start(() => {
			// Set new index and reset translateX to off-screen
			setCurrentIndex(newIndex)
			setImageLoading(true)
			translateX.setValue(fromValue)

			// Animate new photo in
			Animated.timing(translateX, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}).start()
		})
	}

	const returnToCenter = () => {
		Animated.spring(translateX, {
			toValue: 0,
			useNativeDriver: true,
			tension: 150,
			friction: 8,
		}).start(() => {
			translateX.setValue(0)
		})
	}

	const handleGoBack = () => navigation.goBack()

	const downloadImage = async () => {
		try {
			setIsDownloading(true)
			const permissionResult = await MediaLibrary.getPermissionsAsync()
			let finalStatus = permissionResult.status

			if (finalStatus !== "granted") {
				const requestResult = await MediaLibrary.requestPermissionsAsync()
				finalStatus = requestResult.status
			}

			if (finalStatus !== "granted") {
				Alert.alert(
					"Permission Required",
					"To save photos, please allow access to your photo library in Settings.",
					[{ text: "Cancel" }, { text: "OK" }]
				)
				return
			}

			const fileExtension = currentPhoto.file_url.split(".").pop() || "jpg"
			const fileName = `photo_${Date.now()}.${fileExtension}`
			const downloadResult = await FileSystem.downloadAsync(
				currentPhoto.file_url,
				FileSystem.documentDirectory + fileName
			)

			if (downloadResult.status === 200) {
				const asset = await MediaLibrary.createAssetAsync(downloadResult.uri)
				try {
					await MediaLibrary.createAlbumAsync("Downloaded Photos", asset, false)
				} catch (_) {}
				Alert.alert("Success!", "Photo saved to your gallery")
			} else {
				throw new Error("Download failed")
			}
		} catch (error) {
			console.error("Error downloading image:", error)
			Alert.alert("Download Failed", "Unable to save photo. Please try again.")
		} finally {
			setIsDownloading(false)
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
					style={styles.downloadButton}
					onPress={downloadImage}
					disabled={isDownloading}
					activeOpacity={0.7}
				>
					{isDownloading ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Ionicons name="download-outline" size={24} color="#fff" />
					)}
				</TouchableOpacity>
			</SafeAreaView>

			<PanGestureHandler
				onGestureEvent={onGestureEvent}
				onHandlerStateChange={onHandlerStateChange}
				activeOffsetX={[-15, 15]}
				failOffsetY={[-30, 30]}
				minPointers={1}
				maxPointers={1}
				shouldCancelWhenOutside={false}
			>
				<Animated.View
					style={[
						styles.imageContainer,
						{
							transform: [{ translateX }],
							opacity,
						},
					]}
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
			</PanGestureHandler>

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
	downloadButton: { padding: 8, marginRight: -8 },
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
