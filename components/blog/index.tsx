// BlogPostList.tsx
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React from "react"
import {
	Dimensions,
	FlatList,
	Image,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import dayjs from "../../lib/dayjs"
import { BlogPost, BlogPostMedia } from "../../types/post"
import { SocialStackParamList } from "../../types/navigation"
import SchoolCard from "../SchoolCard"
import PhotoSlider from "./PhotoSlider"

type BlogPostListNavigationProp = NativeStackNavigationProp<
	SocialStackParamList,
	"Social"
>

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

const BlogPostList: React.FC<BlogPostListProps> = ({
	emptyTitle = "No hay publicaciones",
	emptySubtitle = "Cuando haya nuevas publicaciones en tu clase, aparecerán aquí",
	posts,
	onRefresh = () => {},
	isRefreshing = false,
	onCardPress,
}) => {
	const navigation = useNavigation<BlogPostListNavigationProp>()


	const EmptyState = () => (
		<View style={styles.emptyState}>
			<View style={styles.emptyIconContainer}>
				<Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
			</View>
			<Text style={styles.emptyTitle}>{emptyTitle}</Text>
			<Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
		</View>
	)

	const renderItem = ({ item }: { item: BlogPost }) => {
		const hasMedia = item.post_media && item.post_media.length > 0

		return (
			<TouchableOpacity
				style={styles.postContainer}
				onPress={() => onCardPress?.(item)}
				activeOpacity={1}
			>
				<SchoolCard>
					{hasMedia && (
						<PhotoSlider
							media={item.post_media || []}
							postTitle={item.title}
							onPress={() => {
								navigation.navigate("PhotoGrid", {
									photos: item.post_media || [],
									title: item.title,
								})
							}}
						/>
					)}
					<View
						style={hasMedia ? styles.postContent : styles.postContentNoImage}
					>
						<Text style={styles.title}>{item.title}</Text>
						<Text style={styles.date}>
							Publicado el{" "}
							{dayjs(item.created_at).format("dddd D [de] MMMM YYYY")}
						</Text>
					</View>
				</SchoolCard>
			</TouchableOpacity>
		)
	}

	return (
		<FlatList
			data={posts}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
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
})

export default BlogPostList
