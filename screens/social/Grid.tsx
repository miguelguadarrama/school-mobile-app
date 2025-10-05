// PhotoGridScreen.tsx
import React, { useState } from "react"
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	Alert,
	Animated,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { BlogPostMedia } from "../../types/post"
import { SocialStackParamList } from "../../types/navigation"
import { SafeAreaView } from "react-native-safe-area-context"

type PhotoGridScreenNavigationProp = NativeStackNavigationProp<
	SocialStackParamList,
	"PhotoGrid"
>

const { width: screenWidth } = Dimensions.get("window")
const imageWidth = screenWidth / 2

const PhotoPlaceholder = () => {
	const pulseAnim = React.useRef(new Animated.Value(0)).current

	React.useEffect(() => {
		const pulse = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		)
		pulse.start()
		return () => pulse.stop()
	}, [])

	const opacity = pulseAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.4, 0.8],
	})

	return (
		<View style={styles.placeholder}>
			<Animated.View style={{ opacity }}>
				<Ionicons name="image-outline" size={48} color="#999" />
			</Animated.View>
		</View>
	)
}

const PhotoGridScreen = () => {
	const route = useRoute()
	const navigation = useNavigation<PhotoGridScreenNavigationProp>()

	const { photos, title } = route.params as {
		photos: BlogPostMedia[]
		title?: string
	}

	const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

	const handleImagePress = (index: number) => {
		navigation.navigate("PhotoViewer", {
			photos, // Pass all photos
			initialIndex: index, // Starting photo index
			title,
		})
	}

	const handleImageError = (photoId: string) => {
		console.warn(`Failed to load image with ID: ${photoId}`)
	}

	const handleImageLoad = (photoId: string) => {
		setLoadedImages((prev) => new Set([...prev, photoId]))
	}

	const handleGoBack = () => {
		navigation.goBack()
	}

	const renderPhotoGrid = () => {
		const rows = []

		// Group photos into pairs for 2-column layout
		for (let i = 0; i < photos.length; i += 2) {
			const leftPhoto = photos[i]
			const rightPhoto = photos[i + 1]

			rows.push(
				<View key={`row-${i}`} style={styles.gridRow}>
					<TouchableOpacity
						style={styles.imageContainer}
						onPress={() => handleImagePress(i)}
						activeOpacity={0.8}
					>
						{!loadedImages.has(leftPhoto.id) && <PhotoPlaceholder />}
						<Image
							source={{ uri: leftPhoto.file_url }}
							style={styles.gridImage}
							onError={() => handleImageError(leftPhoto.id)}
							onLoad={() => handleImageLoad(leftPhoto.id)}
							resizeMode="cover"
						/>
					</TouchableOpacity>

					{rightPhoto && (
						<TouchableOpacity
							style={styles.imageContainer}
							onPress={() => handleImagePress(i + 1)}
							activeOpacity={0.8}
						>
							{!loadedImages.has(rightPhoto.id) && <PhotoPlaceholder />}
							<Image
								source={{ uri: rightPhoto.file_url }}
								style={styles.gridImage}
								onError={() => handleImageError(rightPhoto.id)}
								onLoad={() => handleImageLoad(rightPhoto.id)}
								resizeMode="cover"
							/>
						</TouchableOpacity>
					)}
				</View>
			)
		}

		return rows
	}

	return (
		<SafeAreaView style={styles.container} edges={["top", "bottom"]}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={handleGoBack}
					activeOpacity={0.7}
				>
					<Ionicons name="arrow-back" size={24} color="#333" />
				</TouchableOpacity>

				<View style={styles.headerContent}>
					{title && (
						<>
							<Text style={styles.headerTitle}>{title}</Text>
							<Text style={styles.photoCount}>
								{photos.length} photo{photos.length !== 1 ? "s" : ""}
							</Text>
						</>
					)}
				</View>

				{/* Placeholder for right side balance */}
				<View style={styles.headerRight} />
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{renderPhotoGrid()}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFF", // Black background for photo viewing
	},
	header: {
		backgroundColor: "#FFF",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	backButton: {
		padding: 8,
		marginLeft: -8, // Compensate for padding to align with edge
	},
	headerContent: {
		flex: 1,
		alignItems: "center",
	},
	headerRight: {
		width: 40, // Same width as back button for centering
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
		textAlign: "center",
	},
	photoCount: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	gridRow: {
		flexDirection: "row",
	},
	imageContainer: {
		width: imageWidth,
		aspectRatio: 1, // Square images
	},
	gridImage: {
		width: "100%",
		height: "100%",
		backgroundColor: "#e5e5e5", // Light gray placeholder while loading
	},
	placeholder: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "#e5e5e5",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
	},
})

export default PhotoGridScreen
