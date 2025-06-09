// BlogPostsList.tsx
import dayjs from "../../lib/dayjs"
import React from "react"
import {
	View,
	Text,
	FlatList,
	Image,
	StyleSheet,
	RefreshControl,
	Dimensions,
	TouchableOpacity,
} from "react-native"
import { BlogPost, BlogPostMedia } from "../../types/post"

interface User {
	id: string
	full_name: string
}

interface BlogPostsListProps {
	posts: BlogPost[]
	onRefresh?: () => void
	isRefreshing?: boolean
	onCardPress?: (post: BlogPost) => void
}

//const fallbackImage = "https://placehold.co/600x400/png"
const { width: screenWidth } = Dimensions.get("window")

const BlogPostsList: React.FC<BlogPostsListProps> = ({
	posts,
	onRefresh = () => {},
	isRefreshing = false,
	onCardPress,
}) => {
	// Component to render photo grid for multiple images
	const PhotoGrid = ({ media }: { media: BlogPostMedia[] }) => {
		// Calculate grid layout based on number of images
		const getGridLayout = (count: number) => {
			if (count <= 3) return { rows: 1, cols: count }
			return { rows: 2, cols: 3 }
		}

		const { rows, cols } = getGridLayout(media.length)
		const imageSize = screenWidth / cols

		// Show only the number of images that fit perfectly in the grid
		const maxImages = rows * cols
		const displayMedia = media.slice(0, maxImages)

		return (
			<View style={styles.photoGrid}>
				{Array.from({ length: rows }).map((_, rowIndex) => (
					<View key={rowIndex} style={styles.gridRow}>
						{Array.from({ length: cols }).map((_, colIndex) => {
							const imageIndex = rowIndex * cols + colIndex
							const imageData = displayMedia[imageIndex]

							if (!imageData) return null

							return (
								<Image
									key={imageData.id}
									source={{ uri: imageData.file_url }}
									style={[
										styles.gridImage,
										{ width: imageSize, height: imageSize },
									]}
									onError={({ nativeEvent }) => {
										console.warn("Image loading error:", nativeEvent.error)
									}}
								/>
							)
						})}
					</View>
				))}
				{/* Show count overlay if there are more images than displayed */}
				{media.length > maxImages && (
					<View
						style={[
							styles.moreImagesOverlay,
							{
								width: imageSize,
								height: imageSize,
								right: 0,
								bottom: 0,
							},
						]}
					>
						<Text style={styles.moreImagesText}>
							+{media.length - maxImages}
						</Text>
					</View>
				)}
			</View>
		)
	}

	const renderItem = ({ item }: { item: BlogPost }) => {
		const hasMedia = item.post_media && item.post_media.length > 0

		return (
			<TouchableOpacity
				style={styles.postContainer}
				onPress={() => onCardPress?.(item)}
				activeOpacity={0.7}
			>
				{hasMedia && <PhotoGrid media={item.post_media || []} />}
				<View style={hasMedia ? styles.postContent : styles.postContentNoImage}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.date}>
						Publicado el{" "}
						{dayjs(item.created_at).format("dddd D [de] MMMM YYYY")}
					</Text>
				</View>
			</TouchableOpacity>
		)
	}

	return (
		<FlatList
			data={posts}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			contentContainerStyle={styles.container}
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={onRefresh}
					colors={["#007AFF"]}
					tintColor="#007AFF"
					title="Pull to refresh"
					titleColor="#007AFF"
				/>
			}
			showsVerticalScrollIndicator={false}
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
	},
	postContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		overflow: "hidden",
	},
	singleMedia: {
		width: "100%",
		height: 200,
		backgroundColor: "#eaeaea",
	},
	photoGrid: {
		position: "relative",
	},
	gridRow: {
		flexDirection: "row",
	},
	gridImage: {
		backgroundColor: "#eaeaea",
		maxWidth: "100%",
		maxHeight: 200,
	},
	moreImagesOverlay: {
		position: "absolute",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
	moreImagesText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	postContent: {
		padding: 16,
	},
	postContentNoImage: {
		padding: 20,
		minHeight: 100,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#333",
	},
	author: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	classroom: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	date: {
		fontSize: 12,
		color: "#888",
		marginBottom: 4,
	},
	mediaCount: {
		fontSize: 12,
		color: "#007AFF",
		fontWeight: "500",
	},
})

export default BlogPostsList
