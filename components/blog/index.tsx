// BlogPostList.tsx
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { memo, useCallback, useState } from "react"
import {
	Dimensions,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import dayjs from "../../lib/dayjs"
import { SocialStackParamList } from "../../types/navigation"
import { BlogPost } from "../../types/post"
import SchoolCard from "../SchoolCard"
import PhotoSlider from "./PhotoSlider"

type BlogPostListNavigationProp = NativeStackNavigationProp<
	SocialStackParamList,
	"Social"
>

const max_content_length = 80

interface BlogPostListProps {
	emptyTitle?: string
	emptySubtitle?: string
	posts: BlogPost[]
	onRefresh?: () => void
	isRefreshing?: boolean
	onCardPress?: (post: BlogPost) => void
}

//const fallbackImage = "https://placehold.co/600x400/png"
const { width: screenWidth } = Dimensions.get("window")

// Memoized blog post item component
const BlogPostItem = memo<{
	item: BlogPost
	onCardPress?: (post: BlogPost) => void
	navigation: BlogPostListNavigationProp
}>(({ item, onCardPress, navigation }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const hasMedia = item.post_media && item.post_media.length > 0

	const handlePress = useCallback(() => {
		onCardPress?.(item)
	}, [onCardPress, item])

	const handlePhotoPress = useCallback(() => {
		navigation.navigate("PhotoGrid", {
			photos: item.post_media || [],
			title: item.title,
		})
	}, [navigation, item.post_media, item.title])

	const handleExpandPress = useCallback(
		(e: any) => {
			e.stopPropagation()
			setIsExpanded(!isExpanded)
		},
		[isExpanded]
	)

	// Check if content needs truncation (rough estimate based on character count)
	const contentLength = item.content?.length || 0
	const shouldShowExpandButton = contentLength > max_content_length
	const displayContent =
		isExpanded || !shouldShowExpandButton
			? item.content
			: item.content?.substring(0, max_content_length) + "..."

	return (
		<TouchableOpacity
			style={styles.postContainer}
			onPress={handlePress}
			activeOpacity={1}
		>
			<SchoolCard>
				<View style={styles.postContentFull}>
					{/* Author Section - Now at the top */}
					<View style={styles.authorSection}>
						<View style={styles.avatar}>
							<Ionicons name="person" size={20} color="#666" />
						</View>
						<View style={styles.authorInfo}>
							<Text style={styles.authorName}>
								{item.users.full_name.toLowerCase()}
							</Text>
							<Text style={styles.publishDate}>
								{dayjs(item.created_at).format("dddd D [de] MMMM YYYY")}
							</Text>
						</View>
					</View>

					{/* Title */}
					<Text style={styles.title}>{item.title}</Text>

					{/* Content */}
					{item.content && (
						<View style={styles.contentContainer}>
							<Text style={styles.content}>{displayContent}</Text>
							{shouldShowExpandButton && (
								<TouchableOpacity
									onPress={handleExpandPress}
									style={styles.expandButton}
									activeOpacity={0.7}
								>
									<Text style={styles.expandButtonText}>
										{isExpanded ? "Leer menos" : "Leer más..."}
									</Text>
								</TouchableOpacity>
							)}
						</View>
					)}

					{/* Photo Slider - Now at the bottom */}
					{hasMedia && (
						<PhotoSlider
							media={item.post_media || []}
							postTitle={item.title}
							onPress={handlePhotoPress}
						/>
					)}
				</View>
			</SchoolCard>
		</TouchableOpacity>
	)
})

const BlogPostList: React.FC<BlogPostListProps> = ({
	emptyTitle = "No hay publicaciones",
	emptySubtitle = "Cuando haya nuevas publicaciones en tu clase, aparecerán aquí",
	posts,
	onRefresh = () => {},
	isRefreshing = false,
	onCardPress,
}) => {
	const navigation = useNavigation<BlogPostListNavigationProp>()

	const EmptyState = memo(() => (
		<View style={styles.emptyState}>
			<View style={styles.emptyIconContainer}>
				<Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
			</View>
			<Text style={styles.emptyTitle}>{emptyTitle}</Text>
			<Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
		</View>
	))

	const renderItem = useCallback(
		({ item }: { item: BlogPost }) => (
			<BlogPostItem
				item={item}
				onCardPress={onCardPress}
				navigation={navigation}
			/>
		),
		[onCardPress, navigation]
	)

	const keyExtractor = useCallback((item: BlogPost) => item.id, [])

	const getItemLayout = useCallback(
		(data: any, index: number) => ({
			length: 200, // Approximate item height
			offset: 200 * index,
			index,
		}),
		[]
	)

	return (
		<FlatList
			data={posts}
			renderItem={renderItem}
			keyExtractor={keyExtractor}
			getItemLayout={getItemLayout}
			contentContainerStyle={[
				styles.container,
				!posts || posts.length === 0 ? styles.emptyContainer : {},
			]}
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
			ListEmptyComponent={EmptyState}
			// Performance optimizations
			removeClippedSubviews={true}
			windowSize={10}
			maxToRenderPerBatch={5}
			updateCellsBatchingPeriod={100}
			initialNumToRender={3}
			scrollEventThrottle={16}
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
	},
	emptyContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 80,
	},
	emptyState: {
		alignItems: "center",
		paddingHorizontal: 32,
	},
	emptyIconContainer: {
		marginBottom: 24,
		opacity: 0.6,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
		maxWidth: 280,
	},
	postContainer: {
		//backgroundColor: "#fff",
		//borderRadius: 12,
		marginBottom: 12,
		// shadowColor: "#000",
		// shadowOffset: { width: 0, height: 2 },
		// shadowOpacity: 0.1,
		// shadowRadius: 4,
		// elevation: 2,
		overflow: "hidden",
	},
	postContent: {
		padding: 16,
		paddingHorizontal: 0,
		paddingBottom: 0,
	},
	postContentNoImage: {
		padding: 16,
		paddingHorizontal: 0,
	},
	postContentFull: {
		padding: 0,
		paddingHorizontal: 0,
	},
	authorSection: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 24,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#f0f0f0",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	authorInfo: {
		flex: 1,
	},
	authorName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		marginBottom: 2,
		textTransform: "capitalize",
	},
	publishDate: {
		fontSize: 12,
		color: "#888",
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
	},
	mediaCount: {
		fontSize: 12,
		color: "#007AFF",
		fontWeight: "500",
	},
	contentContainer: {
		marginBottom: 12,
	},
	content: {
		fontSize: 14,
		color: "#555",
		lineHeight: 20,
		marginBottom: 4,
	},
	expandButton: {
		alignSelf: "flex-start",
		paddingVertical: 2,
	},
	expandButtonText: {
		fontSize: 14,
		color: "#007AFF",
		fontWeight: "500",
	},
})

export default BlogPostList
