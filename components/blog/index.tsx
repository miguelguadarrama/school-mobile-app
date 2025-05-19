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
} from "react-native"

interface User {
	id: string
	full_name: string
}

interface PostMedia {
	Id: string
	file_url: string
	caption?: string
}

interface Classroom {
	name: string
}

interface BlogPost {
	id: string
	title: string
	created_at: string
	post_media: PostMedia[]
	users: User
	classrooms: Classroom
}

interface BlogPostsListProps {
	posts: BlogPost[]
	onRefresh?: () => void
	isRefreshing?: boolean
}

const fallbackImage = "https://placehold.co/600x400/png"
const { width: screenWidth } = Dimensions.get("window")

const BlogPostsList: React.FC<BlogPostsListProps> = ({
	posts,
	onRefresh = () => {},
	isRefreshing = false,
}) => {
	// Component to render photo grid for multiple images
	const PhotoGrid = ({ media }: { media: PostMedia[] }) => {
		// Calculate grid layout based on number of images
		const getGridLayout = (count: number) => {
			if (count <= 6) return { rows: 2, cols: 3 }
			return { rows: 2, cols: 3 }
		}

		const { rows, cols } = getGridLayout(media.length)
		const imageSize = screenWidth / cols // 64 = container padding + margins

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
									key={imageData.Id}
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
			</View>
		)
	}

	const renderItem = ({ item }: { item: BlogPost }) => {
		const hasMedia = item.post_media.length > 0
		const showGrid = item.post_media.length >= 6

		return (
			<View style={styles.postContainer}>
				{hasMedia ? (
					showGrid ? (
						<PhotoGrid media={item.post_media} />
					) : (
						<Image
							source={{ uri: item.post_media[0].file_url }}
							style={styles.singleMedia}
							onError={({ nativeEvent }) => {
								console.warn("Image loading error:", nativeEvent.error)
							}}
						/>
					)
				) : (
					<Image
						source={{ uri: fallbackImage }}
						style={styles.singleMedia}
						onError={({ nativeEvent }) => {
							console.warn("Image loading error:", nativeEvent.error)
						}}
					/>
				)}
				<View style={styles.postContent}>
					<Text style={styles.title}>{item.title}</Text>

					<Text style={styles.date}>
						Publicado el{" "}
						{dayjs(item.created_at).format("dddd D [de] MMMM YYYY")}
					</Text>
					{item.post_media.length > 1 && !showGrid && (
						<Text style={styles.mediaCount}>
							{item.post_media.length} photo
							{item.post_media.length > 1 ? "s" : ""}
						</Text>
					)}
				</View>
			</View>
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
					colors={["#007AFF"]} // Android colors
					tintColor="#007AFF" // iOS color
					title="Pull to refresh" // iOS title
					titleColor="#007AFF" // iOS title color
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
