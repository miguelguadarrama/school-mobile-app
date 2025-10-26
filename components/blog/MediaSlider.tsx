import { Ionicons } from "@expo/vector-icons"
import React, { memo, useCallback, useState } from "react"
import {
	Alert,
	Image,
	Linking as RNLinking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { theme } from "../../helpers/theme"
import { BlogPostMedia } from "../../types/post"

interface MediaSliderProps {
	media: BlogPostMedia[]
	postTitle: string
	onPhotoPress: () => void
	onVideoPress?: (videoUrl: string) => void
}

// Video Preview Component with Thumbnail
const VideoPreview: React.FC<{
	video: BlogPostMedia
	thumbnailUrl?: string
	onPress: (url: string) => void
}> = ({ video, thumbnailUrl, onPress }) => {
	// Use thumbnail from separate media item, fallback to video.thumbnail_url (legacy), then placeholder
	const displayThumbnail = thumbnailUrl || video.thumbnail_url

	return (
		<TouchableOpacity
			style={styles.videoContainer}
			onPress={() => onPress(video.file_url)}
			activeOpacity={0.8}
		>
			{displayThumbnail ? (
				<>
					<Image
						source={{ uri: displayThumbnail }}
						style={styles.videoThumbnail}
						resizeMode="cover"
					/>
					<View style={styles.videoOverlay}>
						<Ionicons name="play-circle" size={64} color={theme.colors.white} />
						{video.file_size && (
							<View style={styles.videoSizeBadge}>
								<Text style={styles.videoSize}>
									{(video.file_size / 1024 / 1024).toFixed(1)} MB
								</Text>
							</View>
						)}
					</View>
				</>
			) : (
				<View style={styles.videoPlaceholder}>
					<Ionicons name="videocam" size={48} color={theme.colors.primary} />
					<Text style={styles.videoText}>Ver Video</Text>
					{video.file_size && (
						<Text style={styles.videoSize}>
							{(video.file_size / 1024 / 1024).toFixed(1)} MB
						</Text>
					)}
				</View>
			)}
		</TouchableOpacity>
	)
}

const MediaSlider: React.FC<MediaSliderProps> = memo(
	({ media, onPhotoPress, onVideoPress }) => {
		const [currentIndex, setCurrentIndex] = useState(0)
		const [containerWidth, setContainerWidth] = useState(0)

		const handleScroll = useCallback((event: any) => {
			const { contentOffset, layoutMeasurement } = event.nativeEvent
			const index = Math.round(contentOffset.x / layoutMeasurement.width)
			setCurrentIndex(index)
		}, [])

		const handleContainerLayout = useCallback((event: any) => {
			const { width } = event.nativeEvent.layout
			setContainerWidth(width)
		}, [])

		const handleDocumentPress = useCallback(
			async (url: string, fileName?: string) => {
				try {
					const canOpen = await RNLinking.canOpenURL(url)
					if (canOpen) {
						await RNLinking.openURL(url)
					} else {
						Alert.alert("Error", "No se pudo abrir el documento", [
							{ text: "OK" },
						])
					}
				} catch (error) {
					console.error("Error opening document:", error)
					Alert.alert("Error", "No se pudo abrir el documento", [
						{ text: "OK" },
					])
				}
			},
			[]
		)

		const handleVideoPress = useCallback(
			(url: string) => {
				if (onVideoPress) {
					onVideoPress(url)
				}
			},
			[onVideoPress]
		)

		if (!media || media.length === 0) {
			return null
		}

		// Separate media by type (exclude thumbnails - they're metadata for videos)
		const photos = media.filter(
			(m) => m.media_type === "photo" || !m.media_type
		)
		const videos = media.filter((m) => m.media_type === "video")
		const documents = media.filter((m) => m.media_type === "document")
		const thumbnails = media.filter((m) => m.media_type === "thumbnail")

		// If only photos, render photo slider
		if (photos.length > 0 && videos.length === 0 && documents.length === 0) {
			if (photos.length === 1) {
				return (
					<TouchableOpacity
						style={styles.container}
						onPress={onPhotoPress}
						activeOpacity={0.9}
					>
						<Image
							source={{ uri: photos[0].file_url }}
							style={styles.singleImage}
							resizeMode="cover"
							loadingIndicatorSource={{
								uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
							}}
						/>
					</TouchableOpacity>
				)
			}

			// Don't render until we have container width
			if (containerWidth === 0) {
				return (
					<View style={styles.container} onLayout={handleContainerLayout}>
						<View style={styles.loadingContainer} />
					</View>
				)
			}

			return (
				<View style={styles.container} onLayout={handleContainerLayout}>
					<ScrollView
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						onMomentumScrollEnd={handleScroll}
						style={styles.scrollView}
						scrollEventThrottle={100}
						decelerationRate="fast"
						bounces={false}
						alwaysBounceHorizontal={false}
						directionalLockEnabled={true}
						automaticallyAdjustContentInsets={false}
						contentInsetAdjustmentBehavior="never"
						removeClippedSubviews={true}
						overScrollMode="never"
					>
						{photos.map((item) => (
							<TouchableOpacity
								key={item.id}
								style={[styles.imageContainer, { width: containerWidth }]}
								onPress={onPhotoPress}
								activeOpacity={0.9}
							>
								<Image
									source={{ uri: item.file_url }}
									style={styles.image}
									resizeMode="cover"
									loadingIndicatorSource={{
										uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
									}}
									progressiveRenderingEnabled={true}
									fadeDuration={200}
								/>
							</TouchableOpacity>
						))}
					</ScrollView>

					{/* Indicators or Counter */}
					{photos.length > 1 && (
						<View style={styles.indicatorContainer}>
							{photos.length > 5 ? (
								// Show counter for more than 5 photos
								<View style={styles.counterContainer}>
									<Text style={styles.counterText}>
										{currentIndex + 1} / {photos.length}
									</Text>
								</View>
							) : (
								// Show dot indicators for 5 or fewer photos
								photos.map((_, index) => (
									<View
										key={index}
										style={[
											styles.indicator,
											{
												backgroundColor:
													index === currentIndex
														? theme.colors.primary
														: "rgba(255, 255, 255, 0.4)",
											},
										]}
									/>
								))
							)}
						</View>
					)}
				</View>
			)
		}

		// If only one video, show video player button with thumbnail
		if (videos.length === 1 && photos.length === 0 && documents.length === 0) {
			const video = videos[0]
			// Find the associated thumbnail if it exists
			const thumbnail = thumbnails.length > 0 ? thumbnails[0] : undefined
			return (
				<VideoPreview
					video={video}
					thumbnailUrl={thumbnail?.file_url}
					onPress={handleVideoPress}
				/>
			)
		}

		// If only documents, show document list
		if (documents.length > 0 && photos.length === 0 && videos.length === 0) {
			return (
				<View style={styles.documentsContainer}>
					{documents.map((doc, index: number) => (
						<TouchableOpacity
							key={doc.id}
							style={styles.documentItem}
							onPress={() =>
								handleDocumentPress(doc.file_url, doc.file_url.split("/").pop())
							}
							activeOpacity={0.7}
						>
							<View style={styles.documentIcon}>
								<Ionicons
									name="document-text"
									size={24}
									color={theme.colors.primary}
								/>
							</View>
							<View style={styles.documentInfo}>
								<Text style={styles.documentName} numberOfLines={1}>
									Documento #{index + 1}
								</Text>
								{doc.file_size && (
									<Text style={styles.documentSize}>
										{(doc.file_size / 1024 / 1024).toFixed(2)} MB
									</Text>
								)}
							</View>
							<Ionicons
								name="download-outline"
								size={20}
								color={theme.colors.primary}
							/>
						</TouchableOpacity>
					))}
				</View>
			)
		}

		// Mixed media - shouldn't happen based on validation, but handle gracefully
		return null
	}
)

const styles = StyleSheet.create({
	container: {
		position: "relative",
		overflow: "hidden",
	},
	scrollView: {
		width: "100%",
	},
	loadingContainer: {
		height: 200,
		backgroundColor: "#eaeaea",
	},
	singleImage: {
		width: "100%",
		height: 200,
		backgroundColor: "#eaeaea",
	},
	imageContainer: {
		height: 200,
		justifyContent: "center",
		alignItems: "center",
	},
	image: {
		width: "100%",
		height: "100%",
		backgroundColor: "#eaeaea",
		borderRadius: theme.radius.sm,
	},
	indicatorContainer: {
		position: "absolute",
		bottom: 12,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	indicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginHorizontal: 6,
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.8)",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 2,
	},
	counterContainer: {
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	counterText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "600",
	},
	videoContainer: {
		height: 200,
		backgroundColor: "#000",
		borderRadius: theme.radius.sm,
		overflow: "hidden",
	},
	videoPlaceholder: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(100, 100, 100, 0.8)",
	},
	videoThumbnail: {
		width: "100%",
		height: "100%",
		backgroundColor: "#000",
	},
	videoOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.3)",
	},
	videoSizeBadge: {
		position: "absolute",
		top: theme.spacing.sm,
		right: theme.spacing.sm,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.radius.sm,
	},
	videoText: {
		fontSize: theme.typography.size.lg,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		marginTop: theme.spacing.sm,
	},
	videoSize: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: "rgba(255, 255, 255, 0.9)",
	},
	documentsContainer: {
		gap: theme.spacing.sm,
	},
	documentItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.md,
		padding: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	documentIcon: {
		width: 40,
		height: 40,
		borderRadius: theme.radius.sm,
		backgroundColor: theme.colors.background,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.sm,
	},
	documentInfo: {
		flex: 1,
	},
	documentName: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		marginBottom: 2,
	},
	documentSize: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
	},
})

export default MediaSlider
