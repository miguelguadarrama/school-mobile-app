// PhotoGridScreen.tsx
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { memo, useCallback, useState } from "react"
import {
	Animated,
	Dimensions,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { SocialStackParamList } from "../../types/navigation"
import { BlogPostMedia } from "../../types/post"

type PhotoGridScreenNavigationProp = NativeStackNavigationProp<
	SocialStackParamList,
	"PhotoGrid"
>

const { width: screenWidth } = Dimensions.get("window")
const NUM_COLUMNS = 3
const imageWidth = screenWidth / NUM_COLUMNS

const PhotoPlaceholder = memo(() => {
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
				<Ionicons name="image-outline" size={32} color="#999" />
			</Animated.View>
		</View>
	)
})

// Memoized photo item component for better performance
const PhotoItem = memo<{
	photo: BlogPostMedia
	index: number
	onPress: (index: number) => void
	isLoaded: boolean
	onLoad: (id: string) => void
	onError: (id: string) => void
}>(({ photo, index, onPress, isLoaded, onLoad, onError }) => {
	return (
		<TouchableOpacity
			style={styles.imageContainer}
			onPress={() => onPress(index)}
			activeOpacity={0.8}
		>
			{!isLoaded && <PhotoPlaceholder />}
			<Image
				source={{ uri: photo.file_url }}
				style={styles.gridImage}
				onError={() => onError(photo.id)}
				onLoad={() => onLoad(photo.id)}
				resizeMode="cover"
			/>
		</TouchableOpacity>
	)
})

const PhotoGridScreen = () => {
	const route = useRoute()
	const navigation = useNavigation<PhotoGridScreenNavigationProp>()

	const { photos, title } = route.params as {
		photos: BlogPostMedia[]
		title?: string
	}

	const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

	const handleImagePress = useCallback(
		(index: number) => {
			navigation.navigate("PhotoViewer", {
				photos,
				initialIndex: index,
				title,
			})
		},
		[navigation, photos, title]
	)

	const handleImageError = useCallback((photoId: string) => {
		console.warn(`Failed to load image with ID: ${photoId}`)
	}, [])

	const handleImageLoad = useCallback((photoId: string) => {
		setLoadedImages((prev) => new Set([...prev, photoId]))
	}, [])

	const handleGoBack = useCallback(() => {
		navigation.goBack()
	}, [navigation])

	const renderItem = useCallback(
		({ item, index }: { item: BlogPostMedia; index: number }) => (
			<PhotoItem
				photo={item}
				index={index}
				onPress={handleImagePress}
				isLoaded={loadedImages.has(item.id)}
				onLoad={handleImageLoad}
				onError={handleImageError}
			/>
		),
		[handleImagePress, handleImageLoad, handleImageError, loadedImages]
	)

	const keyExtractor = useCallback((item: BlogPostMedia) => item.id, [])

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

			<FlatList
				data={photos}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				numColumns={NUM_COLUMNS}
				showsVerticalScrollIndicator={false}
				removeClippedSubviews={true}
				maxToRenderPerBatch={15}
				updateCellsBatchingPeriod={50}
				initialNumToRender={15}
				windowSize={5}
				contentContainerStyle={styles.listContent}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFF",
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
		marginLeft: -8,
	},
	headerContent: {
		flex: 1,
		alignItems: "center",
	},
	headerRight: {
		width: 40,
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
	listContent: {
		flexGrow: 1,
	},
	imageContainer: {
		width: imageWidth,
		aspectRatio: 1,
	},
	gridImage: {
		width: "100%",
		height: "100%",
		backgroundColor: "#e5e5e5",
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
