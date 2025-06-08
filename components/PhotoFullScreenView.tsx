// FullScreenPhotoView.tsx
import React, { useRef, useState } from "react"
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	SafeAreaView,
	Alert,
	StatusBar,
	Platform,
} from "react-native"
import { PanGestureHandler, State } from "react-native-gesture-handler"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedGestureHandler,
	runOnJS,
	withSpring,
	withTiming,
} from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import * as MediaLibrary from "expo-media-library"
import * as FileSystem from "expo-file-system"

interface PostMedia {
	Id: string
	file_url: string
	caption?: string
}

interface FullScreenPhotoViewProps {
	media: PostMedia[]
	initialIndex: number
	onBack: () => void
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const FullScreenPhotoView: React.FC<FullScreenPhotoViewProps> = ({
	media,
	initialIndex,
	onBack,
}) => {
	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	const [isDownloading, setIsDownloading] = useState(false)
	const [showControls, setShowControls] = useState(true)

	const translateX = useSharedValue(-currentIndex * screenWidth)
	const scale = useSharedValue(1)
	const opacity = useSharedValue(1)

	// Auto-hide controls after 3 seconds
	const controlsTimeoutRef = useRef<NodeJS.Timeout>(null)

	const resetControlsTimeout = () => {
		if (controlsTimeoutRef.current) {
			clearTimeout(controlsTimeoutRef.current)
		}
		setShowControls(true)
		controlsTimeoutRef.current = setTimeout(() => {
			setShowControls(false)
		}, 3000)
	}

	React.useEffect(() => {
		resetControlsTimeout()
		return () => {
			if (controlsTimeoutRef.current) {
				clearTimeout(controlsTimeoutRef.current)
			}
		}
	}, [])

	const onSwipeUpdate = (nextIndex: number) => {
		if (nextIndex >= 0 && nextIndex < media.length) {
			setCurrentIndex(nextIndex)
		}
	}

	const panGestureHandler = useAnimatedGestureHandler({
		onStart: () => {
			runOnJS(resetControlsTimeout)()
		},
		onActive: (event) => {
			translateX.value = -currentIndex * screenWidth + event.translationX
		},
		onEnd: (event) => {
			const threshold = screenWidth * 0.3
			const velocity = event.velocityX

			if (event.translationX > threshold || velocity > 500) {
				// Swipe right (previous image)
				const nextIndex = Math.max(0, currentIndex - 1)
				translateX.value = withSpring(-nextIndex * screenWidth)
				runOnJS(onSwipeUpdate)(nextIndex)
			} else if (event.translationX < -threshold || velocity < -500) {
				// Swipe left (next image)
				const nextIndex = Math.min(media.length - 1, currentIndex + 1)
				translateX.value = withSpring(-nextIndex * screenWidth)
				runOnJS(onSwipeUpdate)(nextIndex)
			} else {
				// Snap back to current image
				translateX.value = withSpring(-currentIndex * screenWidth)
			}
		},
	})

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }, { scale: scale.value }],
		opacity: opacity.value,
	}))

	const downloadImage = async () => {
		try {
			setIsDownloading(true)

			// Request permissions
			const { status } = await MediaLibrary.requestPermissionsAsync()
			if (status !== "granted") {
				Alert.alert(
					"Permisos requeridos",
					"Se necesitan permisos para acceder a la galería de fotos."
				)
				return
			}

			const currentMedia = media[currentIndex]
			const fileUri =
				FileSystem.documentDirectory + `photo_${currentMedia.Id}.jpg`

			// Download the image
			const downloadResult = await FileSystem.downloadAsync(
				currentMedia.file_url,
				fileUri
			)

			if (downloadResult.status === 200) {
				// Save to media library
				const asset = await MediaLibrary.createAssetAsync(downloadResult.uri)
				await MediaLibrary.createAlbumAsync("Downloaded Photos", asset, false)

				Alert.alert(
					"¡Descarga completa!",
					"La foto se ha guardado en tu galería."
				)
			} else {
				throw new Error("Download failed")
			}
		} catch (error) {
			console.error("Error downloading image:", error)
			Alert.alert(
				"Error",
				"No se pudo descargar la imagen. Inténtalo nuevamente."
			)
		} finally {
			setIsDownloading(false)
		}
	}

	const handleScreenTap = () => {
		setShowControls(!showControls)
		if (!showControls) {
			resetControlsTimeout()
		}
	}

	React.useEffect(() => {
		translateX.value = withTiming(-currentIndex * screenWidth, {
			duration: 300,
		})
	}, [currentIndex])

	return (
		<View style={styles.container}>
			<StatusBar hidden={!showControls} />

			{/* Header Controls */}
			{showControls && (
				<Animated.View
					style={styles.headerControls}
					entering={{ opacity: withTiming(1) }}
					exiting={{ opacity: withTiming(0) }}
				>
					<SafeAreaView style={styles.safeArea}>
						<View style={styles.header}>
							<TouchableOpacity style={styles.headerButton} onPress={onBack}>
								<Ionicons name="arrow-back" size={24} color="#fff" />
							</TouchableOpacity>
							<Text style={styles.headerTitle}>
								{currentIndex + 1} de {media.length}
							</Text>
							<TouchableOpacity
								style={styles.headerButton}
								onPress={downloadImage}
								disabled={isDownloading}
							>
								<Ionicons
									name={
										isDownloading ? "hourglass-outline" : "download-outline"
									}
									size={24}
									color="#fff"
								/>
							</TouchableOpacity>
						</View>
					</SafeAreaView>
				</Animated.View>
			)}

			{/* Photo Swiper */}
			<PanGestureHandler onGestureEvent={panGestureHandler}>
				<Animated.View style={[styles.imageContainer, animatedStyle]}>
					{media.map((item, index) => (
						<TouchableOpacity
							key={item.Id}
							style={styles.imageWrapper}
							onPress={handleScreenTap}
							activeOpacity={1}
						>
							<Image
								source={{ uri: item.file_url }}
								style={styles.image}
								resizeMode="contain"
								onError={({ nativeEvent }) => {
									console.warn("Image loading error:", nativeEvent.error)
								}}
							/>
						</TouchableOpacity>
					))}
				</Animated.View>
			</PanGestureHandler>

			{/* Caption */}
			{showControls && media[currentIndex]?.caption && (
				<Animated.View
					style={styles.captionContainer}
					entering={{ opacity: withTiming(1) }}
					exiting={{ opacity: withTiming(0) }}
				>
					<SafeAreaView>
						<Text style={styles.caption}>{media[currentIndex].caption}</Text>
					</SafeAreaView>
				</Animated.View>
			)}

			{/* Navigation Dots */}
			{showControls && media.length > 1 && (
				<Animated.View
					style={styles.dotsContainer}
					entering={{ opacity: withTiming(1) }}
					exiting={{ opacity: withTiming(0) }}
				>
					<View style={styles.dots}>
						{media.map((_, index) => (
							<TouchableOpacity
								key={index}
								style={[styles.dot, index === currentIndex && styles.activeDot]}
								onPress={() => setCurrentIndex(index)}
							/>
						))}
					</View>
				</Animated.View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	headerControls: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	safeArea: {
		paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	headerButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	headerTitle: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
	imageContainer: {
		flex: 1,
		flexDirection: "row",
		width: screenWidth * media?.length || screenWidth,
	},
	imageWrapper: {
		width: screenWidth,
		height: screenHeight,
		justifyContent: "center",
		alignItems: "center",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	captionContainer: {
		position: "absolute",
		bottom: 80,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	caption: {
		color: "#fff",
		fontSize: 16,
		textAlign: "center",
		lineHeight: 22,
	},
	dotsContainer: {
		position: "absolute",
		bottom: 30,
		left: 0,
		right: 0,
		alignItems: "center",
	},
	dots: {
		flexDirection: "row",
		justifyContent: "center",
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "rgba(255, 255, 255, 0.4)",
		marginHorizontal: 4,
	},
	activeDot: {
		backgroundColor: "#fff",
	},
})

export default FullScreenPhotoView
