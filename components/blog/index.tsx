// BlogPostList.tsx
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { memo, useCallback, useContext, useEffect, useState } from "react"
import {
	FlatList,
	Image,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import AppContext from "../../contexts/AppContext"
import { TabContext } from "../../contexts/TabContext"
import { getStaffPhotoUrl } from "../../helpers/staff"
import { theme } from "../../helpers/theme"
import dayjs from "../../lib/dayjs"
import { fetcher } from "../../services/api"
import { SocialStackParamList } from "../../types/navigation"
import { BlogPost } from "../../types/post"
import SchoolCard from "../SchoolCard"
import MediaSlider from "./MediaSlider"
import { PostStatsViewer } from "./PostStatsViewer"
import { VideoPlayerModal } from "./VideoPlayerModal"

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

// Helper function to format numbers in compact form (1.2k, 1.5M, etc.)
const formatCompactNumber = (num: number): string => {
	if (num < 1000) return num.toString()
	if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k"
	return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
}

//const fallbackImage = "https://placehold.co/600x400/png"
//const { width: screenWidth } = Dimensions.get("window")

// Memoized blog post item component
const BlogPostItem = memo<{
	item: BlogPost
	onCardPress?: (post: BlogPost) => void
	onStatsPress?: (postId: string) => void
	navigation: BlogPostListNavigationProp
}>(({ item, onCardPress, onStatsPress, navigation }) => {
	const { selectedRole } = useContext(AppContext)!
	const [isExpanded, setIsExpanded] = useState(false)
	const [photoError, setPhotoError] = useState(false)
	const [videoModalVisible, setVideoModalVisible] = useState(false)
	const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
	const [selectedVideoSize, setSelectedVideoSize] = useState<number | null>(null)
	const hasMedia = item.post_media && item.post_media.length > 0
	const staffPhotoUrl = item.users?.id ? getStaffPhotoUrl(item.users.id) : null

	const isAdminOrStaff = ["admin", "staff"].includes(selectedRole || "")
	const handlePress = useCallback(() => {
		onCardPress?.(item)
	}, [onCardPress, item])

	const handlePhotoPress = useCallback(() => {
		// Record hit (fire and forget)
		fetcher(`/mobile/posts/${item.id}/hit`, { method: "POST" }).catch(() => {})

		// Only navigate to photo grid if there are photos
		const photos =
			item.post_media?.filter(
				(m) => !m.media_type || m.media_type === "photo"
			) || []
		if (photos.length > 0) {
			navigation.navigate("PhotoGrid", {
				photos,
				title: item.title,
			})
		}
	}, [navigation, item.post_media, item.title, item.id])

	const handleVideoPress = useCallback(
		(videoUrl: string, fileSize?: number | null) => {
			// Record hit (fire and forget)
			fetcher(`/mobile/posts/${item.id}/hit`, { method: "POST" }).catch(
				() => {}
			)

			setSelectedVideoUrl(videoUrl)
			setSelectedVideoSize(fileSize ?? null)
			setVideoModalVisible(true)
		},
		[item.id]
	)

	const handleCloseVideoModal = useCallback(() => {
		setVideoModalVisible(false)
		setSelectedVideoUrl(null)
		setSelectedVideoSize(null)
	}, [])

	const handleExpandPress = useCallback(
		(e: any) => {
			e.stopPropagation()
			setIsExpanded(!isExpanded)
		},
		[isExpanded]
	)

	const handleStatsPress = useCallback(
		(e: any) => {
			e.stopPropagation()
			onStatsPress?.(item.id)
		},
		[onStatsPress, item.id]
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
						{staffPhotoUrl && !photoError ? (
							<Image
								source={{ uri: staffPhotoUrl }}
								style={styles.avatar}
								onError={() => setPhotoError(true)}
							/>
						) : (
							<View style={styles.avatar}>
								<Ionicons name="person" size={20} color="#666" />
							</View>
						)}
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

					{/* Media Slider - Now at the bottom */}
					{hasMedia && (
						<MediaSlider
							media={item.post_media || []}
							postTitle={item.title}
							postId={item.id}
							onPhotoPress={handlePhotoPress}
							onVideoPress={handleVideoPress}
						/>
					)}

					{/* Footer with classroom info */}
					{item.classrooms?.name && (
						<View style={styles.footer}>
							<Text style={styles.classroomText}>{item.classrooms.name}</Text>
						</View>
					)}

					{/* View metrics for admin/staff */}
					{isAdminOrStaff &&
						(item.post_views !== undefined ||
							(item.post_clicks !== undefined && item.post_clicks > 0)) && (
							<TouchableOpacity
								style={styles.metricsContainer}
								onPress={handleStatsPress}
								activeOpacity={0.7}
							>
								{item.post_views !== undefined && (
									<>
										<Ionicons
											name="eye-outline"
											size={14}
											color={theme.colors.muted}
										/>
										<Text style={styles.metricsText}>
											{formatCompactNumber(item.post_views)}{" "}
											{item.post_views === 1 ? "vista" : "vistas"}
										</Text>
									</>
								)}
								{item.post_clicks !== undefined && item.post_clicks > 0 && (
									<>
										{item.post_views !== undefined && (
											<Text style={styles.metricsSeparator}>•</Text>
										)}
										<Ionicons
											name="download-outline"
											size={14}
											color={theme.colors.muted}
										/>
										<Text style={styles.metricsText}>
											{formatCompactNumber(item.post_clicks)}{" "}
											{item.post_clicks === 1 ? "descarga" : "descargas"}
										</Text>
									</>
								)}
								<Ionicons
									name="chevron-forward"
									size={14}
									color={theme.colors.muted}
									style={{ marginLeft: 4 }}
								/>
							</TouchableOpacity>
						)}
				</View>
			</SchoolCard>

			{/* Video Player Modal */}
			<VideoPlayerModal
				visible={videoModalVisible}
				videoUrl={selectedVideoUrl}
				videoSize={selectedVideoSize}
				onClose={handleCloseVideoModal}
			/>
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
	const { setIsPostStatsViewerActive } = useContext(TabContext)
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

	// Update TabContext when stats viewer is opened/closed
	useEffect(() => {
		setIsPostStatsViewerActive(selectedPostId !== null)
	}, [selectedPostId, setIsPostStatsViewerActive])

	const handleStatsPress = useCallback((postId: string) => {
		setSelectedPostId(postId)
	}, [])

	const handleCloseStatsViewer = useCallback(() => {
		setSelectedPostId(null)
	}, [])

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
				onStatsPress={handleStatsPress}
				navigation={navigation}
			/>
		),
		[onCardPress, handleStatsPress, navigation]
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
		<>
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

			{/* Post Stats Viewer - Rendered at top level */}
			{selectedPostId && (
				<PostStatsViewer
					postId={selectedPostId}
					onBack={handleCloseStatsViewer}
				/>
			)}
		</>
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
	footer: {
		marginTop: 0,
		paddingTop: theme.spacing.xs,
	},
	classroomText: {
		fontSize: 12,
		color: theme.colors.muted,
		fontWeight: "500",
	},
	publishDate: {
		fontSize: 12,
		color: theme.colors.muted,
		textTransform: "capitalize",
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
	metricsContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: theme.spacing.xs,
		paddingTop: theme.spacing.xs,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
		gap: 6,
	},
	metricsText: {
		fontSize: 12,
		color: theme.colors.muted,
		fontWeight: "500",
	},
	metricsSeparator: {
		fontSize: 12,
		color: theme.colors.muted,
		marginHorizontal: 4,
	},
})

export default BlogPostList
