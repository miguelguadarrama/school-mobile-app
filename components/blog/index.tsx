import React from "react"
import {
	View,
	Text,
	FlatList,
	Image,
	StyleSheet,
	RefreshControl,
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

const BlogPostsList: React.FC<BlogPostsListProps> = ({
	posts,
	onRefresh = () => {},
	isRefreshing = false,
}) => {
	const renderItem = ({ item }: { item: BlogPost }) => {
		const firstMedia =
			item.post_media.length > 0 ? item.post_media[0].file_url : fallbackImage

		return (
			<View style={styles.postContainer}>
				<Image
					source={{ uri: firstMedia }}
					style={styles.media}
					onError={({ nativeEvent }) => {
						console.warn("Image loading error:", nativeEvent.error)
					}}
				/>
				<Text style={styles.title}>{item.title}</Text>
				<Text style={styles.date}>
					Posted on: {new Date(item.created_at).toLocaleDateString()}
				</Text>
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
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	postContainer: {
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	media: {
		width: "100%",
		height: 150,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: "#eaeaea",
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 4,
	},
	author: {
		fontSize: 14,
		color: "#555",
	},
	classroom: {
		fontSize: 14,
		color: "#555",
	},
	date: {
		fontSize: 12,
		color: "#777",
		marginTop: 4,
	},
})

export default BlogPostsList
