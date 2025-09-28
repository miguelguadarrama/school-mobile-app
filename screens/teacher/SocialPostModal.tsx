import { Ionicons } from "@expo/vector-icons"
import React, { useContext, useEffect, useState } from "react"
import {
	ActivityIndicator,
	BackHandler,
	FlatList,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import useSWR from "swr"
import { PostEditor, PostFormData } from "../../components/teacher/PostEditor"
import AppContext from "../../contexts/AppContext"
import { TabContext } from "../../contexts/TabContext"
import { theme } from "../../helpers/theme"
import { BlogPost } from "../../types/post"

interface SocialPostModalProps {
	onBack: () => void
}

export const SocialPostModal: React.FC<SocialPostModalProps> = ({ onBack }) => {
	const { setIsSocialPostModalActive } = useContext(TabContext)
	const { classrooms } = useContext(AppContext)!
	const insets = useSafeAreaInsets()
	const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
		null
	)
	const [currentView, setCurrentView] = useState<"list" | "editor">("list")
	const [editingPost, setEditingPost] = useState<BlogPost | undefined>(
		undefined
	)
	const {
		data: posts,
		isLoading,
		isValidating,
		mutate: refreshPosts,
	} = useSWR<BlogPost[]>(
		selectedClassroom ? `/mobile/teacher/${selectedClassroom}/posts` : null
	)

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
	}

	const getPostStatus = (post: BlogPost) => {
		return post.published_at ? "Publicado" : "Borrador"
	}

	const getPostStatusColor = (post: BlogPost) => {
		return post.published_at ? theme.colors.success : theme.colors.warning
	}

	const handleCreateNewPost = () => {
		setEditingPost(undefined)
		setCurrentView("editor")
	}

	const handleEditPost = (post: BlogPost) => {
		setEditingPost(post)
		setCurrentView("editor")
	}

	const handleBackFromEditor = () => {
		setEditingPost(undefined)
		setCurrentView("list")
	}

	const handleSavePost = async (postData: PostFormData) => {
		// TODO: Implement API call to save/update post
		console.log("Saving post:", postData)
		console.log("Editing post:", editingPost?.id)
		console.log("Classroom:", selectedClassroom)

		// Refresh posts list
		if (refreshPosts) {
			await refreshPosts()
		}

		// For now, just go back to list view
		// In real implementation, you would make API call here
		handleBackFromEditor()
	}

	const handleDraftCreated = (createdPost: BlogPost) => {
		// Switch to edit mode with the newly created post
		setEditingPost(createdPost)

		// Refresh posts list to show the new draft
		if (refreshPosts) {
			refreshPosts()
		}
	}

	const getSelectedClassroomName = () => {
		const classroom = classrooms?.find((c) => c.id === selectedClassroom)
		return classroom?.name || "Salón"
	}

	useEffect(() => {
		if (classrooms && classrooms.length > 0) {
			setSelectedClassroom(classrooms[0].id)
		}
	}, [classrooms])

	useEffect(() => {
		// Set modal as active when component mounts
		setIsSocialPostModalActive(true)

		const handleBackPress = () => {
			onBack()
			return true
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => {
			// Clean up when component unmounts
			setIsSocialPostModalActive(false)
			backHandler.remove()
		}
	}, [onBack, setIsSocialPostModalActive])

	return (
		<View style={styles.modalContainer}>
			{/* Header */}
			<SafeAreaView edges={["top"]} style={styles.modalHeaderContainer}>
				<View style={styles.modalHeader}>
					<TouchableOpacity style={styles.backButton} onPress={onBack}>
						<Ionicons
							name="chevron-back"
							size={24}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
					<View style={styles.modalHeaderInfo}>
						<Text style={styles.modalTitle}>Publicaciones</Text>
						<Text style={styles.modalSubtitle}>Gestionar contenido social</Text>
					</View>
				</View>
			</SafeAreaView>

			{/* Content */}
			<View style={styles.modalContent}>
				{/* Classroom Selector */}
				<View style={styles.classroomSection}>
					<Text style={styles.sectionTitle}>Salón de Clases</Text>
					{classrooms && classrooms.length > 1 ? (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.classroomSelector}
						>
							{classrooms.map((classroom) => (
								<TouchableOpacity
									key={classroom.id}
									style={[
										styles.classroomOption,
										selectedClassroom === classroom.id &&
											styles.classroomOptionSelected,
									]}
									activeOpacity={1}
									onPress={() => setSelectedClassroom(classroom.id)}
								>
									<Text
										style={[
											styles.classroomOptionText,
											selectedClassroom === classroom.id &&
												styles.classroomOptionTextSelected,
										]}
									>
										{classroom.name}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					) : (
						<View style={styles.singleClassroom}>
							<Text style={styles.singleClassroomText}>
								{classrooms?.[0]?.name || "Sin salón asignado"}
							</Text>
						</View>
					)}
				</View>

				{/* Create New Post Button */}
				<View style={styles.createPostSection}>
					<TouchableOpacity
						style={styles.createNewPostButton}
						onPress={handleCreateNewPost}
					>
						<Ionicons name="add" size={20} color={theme.colors.white} />
						<Text style={styles.createNewPostButtonText}>
							Crear Nueva Publicación
						</Text>
					</TouchableOpacity>
				</View>

				{/* Posts List */}
				<View style={styles.postsSection}>
					<Text style={styles.sectionTitle}>Publicaciones</Text>

					{isLoading || isValidating ? (
						<View
							style={[
								styles.loadingContainer,
								{ paddingBottom: insets.bottom + theme.spacing.lg },
							]}
						>
							<ActivityIndicator size="large" color={theme.colors.primary} />
							<Text style={styles.loadingText}>Cargando publicaciones...</Text>
						</View>
					) : posts && posts.length > 0 ? (
						<FlatList
							data={posts}
							keyExtractor={(item) => item.id}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{
								paddingBottom: insets.bottom + theme.spacing.lg,
							}}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.postItem}
									onPress={() => handleEditPost(item)}
								>
									<View style={styles.postHeader}>
										<Text style={styles.postTitle} numberOfLines={2}>
											{item.title}
										</Text>
										<View
											style={[
												styles.postStatus,
												{ backgroundColor: getPostStatusColor(item) },
											]}
										>
											<Text style={styles.postStatusText}>
												{getPostStatus(item)}
											</Text>
										</View>
									</View>
									<Text style={styles.postContent} numberOfLines={3}>
										{item.content}
									</Text>
									<View style={styles.postFooter}>
										<Text style={styles.postDate}>
											{formatDate(item.created_at)}
										</Text>
										{item.post_media && item.post_media.length > 0 && (
											<View style={styles.mediaIndicator}>
												<Ionicons
													name="image"
													size={16}
													color={theme.colors.muted}
												/>
												<Text style={styles.mediaCount}>
													{item.post_media.length}
												</Text>
											</View>
										)}
									</View>
								</TouchableOpacity>
							)}
						/>
					) : (
						<View
							style={[
								styles.emptyContainer,
								{ paddingBottom: insets.bottom + theme.spacing.lg },
							]}
						>
							<Ionicons
								name="document-text-outline"
								size={48}
								color={theme.colors.muted}
							/>
							<Text style={styles.emptyTitle}>No hay publicaciones</Text>
							<Text style={styles.emptySubtitle}>
								Crea tu primera publicación para este salón
							</Text>
						</View>
					)}
				</View>
			</View>

			{/* PostEditor Modal Overlay */}
			{currentView === "editor" && (
				<PostEditor
					post={editingPost}
					classroomId={selectedClassroom || ""}
					classroomName={getSelectedClassroomName()}
					onBack={handleBackFromEditor}
					onSave={handleSavePost}
					onDraftCreated={handleDraftCreated}
					refreshPosts={refreshPosts}
				/>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 1000,
	},
	modalHeaderContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	modalHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	backButton: {
		marginRight: theme.spacing.md,
		padding: theme.spacing.xs,
	},
	modalHeaderInfo: {
		flex: 1,
		paddingRight: theme.spacing.md,
	},
	modalTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		color: theme.colors.text,
		fontWeight: "600",
	},
	modalSubtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginTop: 2,
	},
	modalContent: {
		flex: 1,
		padding: theme.spacing.lg,
	},
	// Classroom Selector Styles
	classroomSection: {
		marginBottom: theme.spacing.lg,
	},
	sectionTitle: {
		fontSize: theme.typography.size.lg,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	classroomSelector: {
		flexDirection: "row",
	},
	classroomOption: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		marginRight: theme.spacing.sm,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
	},
	classroomOptionSelected: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	classroomOptionText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
	},
	classroomOptionTextSelected: {
		color: theme.colors.white,
		fontFamily: theme.typography.family.bold,
	},
	singleClassroom: {
		paddingVertical: theme.spacing.sm,
	},
	singleClassroomText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.primary,
	},
	// Create Post Section
	createPostSection: {
		marginBottom: theme.spacing.lg,
	},
	createNewPostButton: {
		backgroundColor: theme.colors.primary,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderRadius: theme.radius.md,
	},
	createNewPostButtonText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		marginLeft: theme.spacing.xs,
	},
	// Posts Section
	postsSection: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xl,
	},
	loadingText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		marginTop: theme.spacing.md,
		textAlign: "center",
	},
	postItem: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.md,
		padding: theme.spacing.md,
		marginBottom: theme.spacing.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	postHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.sm,
	},
	postTitle: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		flex: 1,
		marginRight: theme.spacing.sm,
	},
	postStatus: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs / 2,
		borderRadius: theme.radius.sm,
	},
	postStatusText: {
		fontSize: 12,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		textTransform: "uppercase",
	},
	postContent: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		lineHeight: 20,
		marginBottom: theme.spacing.sm,
	},
	postFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	postDate: {
		fontSize: 12,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
	},
	mediaIndicator: {
		flexDirection: "row",
		alignItems: "center",
	},
	mediaCount: {
		fontSize: 12,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		marginLeft: 4,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xl,
	},
	emptyTitle: {
		fontSize: theme.typography.size.lg,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.xs,
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		textAlign: "center",
	},
})
