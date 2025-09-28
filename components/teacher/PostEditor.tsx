import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
	BackHandler,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { theme } from "../../helpers/theme"
import { fetcher } from "../../services/api"
import { BlogPost } from "../../types/post"
import { MediaManager } from "./MediaManager"

interface PostEditorProps {
	post?: BlogPost // undefined for new post, BlogPost for editing
	classroomId: string
	classroomName: string
	onBack: () => void
	onSave: (postData: PostFormData) => void
	onDraftCreated?: (createdPost: BlogPost) => void // Callback when draft is created
	refreshPosts?: () => Promise<void | undefined | BlogPost[]>
}

export interface PostFormData {
	title: string
	content: string
	published: boolean
	mediaFiles: MediaFile[]
}

export interface MediaFile {
	id?: string // existing media will have id
	uri: string
	type: "image" | "video"
	caption?: string
}

export const PostEditor: React.FC<PostEditorProps> = ({
	post,
	classroomId,
	classroomName,
	onBack,
	onSave,
	onDraftCreated,
}) => {
	const insets = useSafeAreaInsets()
	const [status, setStatus] = useState<"idle" | "busy">("idle")
	const [title, setTitle] = useState(post?.title || "")
	const [content, setContent] = useState(post?.content || "")
	const [published, setPublished] = useState(!!post?.published_at)
	const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(
		post?.post_media?.map((media) => ({
			id: media.id,
			uri: media.file_url,
			type:
				media.file_url.includes(".mp4") || media.file_url.includes(".mov")
					? "video"
					: "image",
			caption: media.caption || "",
		})) || []
	)
	const [isSaving, setIsSaving] = useState(false)

	const isEditing = !!post
	const hasChanges = () => {
		if (!isEditing) {
			return (
				title.trim() !== "" || content.trim() !== "" || mediaFiles.length > 0
			)
		}

		return (
			title !== (post?.title || "") ||
			content !== (post?.content || "") ||
			published !== !!post?.published_at ||
			JSON.stringify(mediaFiles) !==
				JSON.stringify(
					post?.post_media?.map((media) => ({
						id: media.id,
						uri: media.file_url,
						type:
							media.file_url.includes(".mp4") || media.file_url.includes(".mov")
								? "video"
								: "image",
						caption: media.caption || "",
					})) || []
				)
		)
	}

	const requestUploadUrl = async () => {
		if (!post?.id) return false

		// Filter only new media files (without id)
		const newMediaFiles = mediaFiles.filter((file) => !file.id)
		if (newMediaFiles.length === 0) return []

		// use this function to request upload URLs
		const response = await fetcher(
			`/mobile/posts/classroom/${classroomId}/sas`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					post_id: post?.id,
					files: newMediaFiles.map((file) => ({
						type: file.type,
						name: file.uri.split("/").pop() || "image.jpg", // Extract filename from URI
					})),
				}),
			}
		)
		if (!response || !Array.isArray(response)) {
			throw new Error("Invalid response from server")
		}
		return response as { file: string; sasUrl: string }[]
	}

	const uploadFileToSas = async (
		fileUri: string,
		sasUrl: string
	): Promise<boolean> => {
		//console.log("Uploading file to SAS URL:", { fileUri, sasUrl })
		try {
			// Read file as blob
			const response = await fetch(fileUri)
			const blob = await response.blob()

			// Upload to SAS URL
			const uploadResponse = await fetch(sasUrl, {
				method: "PUT",
				body: blob,
				headers: {
					"x-ms-blob-type": "BlockBlob",
				},
			})

			return uploadResponse.ok
		} catch (error) {
			console.error("Error uploading file:", error)
			return false
		}
	}

	const savePostWithMedia = async (
		uploadedFiles: { file: string; sasUrl: string }[]
	) => {
		if (!post?.id) {
			throw new Error("Post ID is required to save post with media")
		}
		// Create media array with both existing and new media
		const existingMedia = mediaFiles
			.filter((file) => file.id)
			.map((file) => ({
				id: file.id!,
				file_url: file.uri,
				caption: file.caption || "",
			}))

		const newMedia = uploadedFiles.map((uploadedFile) => {
			const originalFile = mediaFiles.find(
				(file) => !file.id && file.uri.split("/").pop() === uploadedFile.file
			)
			return {
				file_url: uploadedFile.sasUrl.split("?")[0], // Remove SAS token from URL
				caption: originalFile?.caption || "",
			}
		})

		const allMedia = [...existingMedia, ...newMedia]
		console.log({ allMedia })

		// Save post with media
		const response = await fetcher(
			`/mobile/teacher/${classroomId}/posts/${post.id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: title.trim(),
					content: content.trim(),
					published,
					media: allMedia,
				}),
			}
		)

		return response
	}

	const handleCreateDraft = async () => {
		if (!title.trim() || !content.trim()) {
			// TODO: Show validation error
			return
		}

		setStatus("busy")

		try {
			const response = (await fetcher(
				`/mobile/posts/classroom/${classroomId}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						title: title.trim(),
						content: content.trim(),
					}),
				}
			)) as BlogPost

			if (response?.id) {
				// Draft created successfully
				const createdPost: BlogPost = response

				// Notify parent component about the created draft
				if (onDraftCreated) {
					onDraftCreated(createdPost)
				}

				// Also call onSave for backward compatibility
				onSave({
					title: title.trim(),
					content: content.trim(),
					published: false,
					mediaFiles: [],
				})
			} else {
				// TODO: Show error message
				console.error("Failed to create draft:", "Unknown error")
			}
		} catch (error) {
			// TODO: Show error message
			console.error("Error creating draft:", error)
		} finally {
			setStatus("idle")
		}
	}

	const handleSave = async () => {
		if (!title.trim() || !content.trim()) {
			// TODO: Show validation error
			return
		}

		setStatus("busy")

		try {
			// Check if there are new media files to upload
			const newMediaFiles = mediaFiles.filter((file) => !file.id)

			if (newMediaFiles.length > 0) {
				// Step 1: Request upload URLs for new media files
				const uploadUrls = await requestUploadUrl()
				if (!uploadUrls) {
					throw new Error("Failed to get upload URLs")
				}

				console.log({ uploadUrls })

				// Step 2: Upload each file to its SAS URL
				const uploadPromises = uploadUrls.map(async (urlData) => {
					const mediaFile = newMediaFiles.find(
						(file) => file.uri.split("/").pop() === urlData.file
					)
					if (!mediaFile) {
						throw new Error(`Media file not found for ${urlData.file}`)
					}

					const success = await uploadFileToSas(mediaFile.uri, urlData.sasUrl)
					if (!success) {
						throw new Error(`Failed to upload ${urlData.file}`)
					}
					return urlData
				})

				const uploadedFiles = await Promise.all(uploadPromises)

				// Step 3: Save post with media array
				await savePostWithMedia(uploadedFiles)
			} else {
				// No new media files, just update the post
				await savePostWithMedia([])
			}

			// Notify parent component
			onSave({
				title: title.trim(),
				content: content.trim(),
				published,
				mediaFiles,
			})
		} catch (error) {
			console.error("Error saving post:", error)
			// TODO: Show error message to user
		} finally {
			setStatus("idle")
		}
	}

	const isBusy = status === "busy"
	const canCreateDraft =
		!isEditing && title.trim() !== "" && content.trim() !== "" && !isBusy
	const canSave =
		isEditing &&
		title.trim() !== "" &&
		content.trim() !== "" &&
		hasChanges() &&
		!isBusy

	useEffect(() => {
		const handleBackPress = () => {
			onBack()
			return true
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => backHandler.remove()
	}, [onBack])

	return (
		<View style={styles.container}>
			{/* Header */}
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={onBack}>
						<Ionicons
							name="chevron-back"
							size={24}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
					<View style={styles.headerInfo}>
						<Text style={styles.headerTitle}>
							{isEditing ? "Editar Publicación" : "Nueva Publicación"}
						</Text>
						<Text style={styles.headerSubtitle}>{classroomName}</Text>
					</View>
					{isEditing && (
						<TouchableOpacity
							style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
							onPress={handleSave}
							disabled={!canSave}
						>
							<Text
								style={[
									styles.saveButtonText,
									!canSave && styles.saveButtonTextDisabled,
								]}
							>
								{isBusy ? "Guardando..." : "Guardar"}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</SafeAreaView>

			{/* Content */}
			<ScrollView
				style={styles.content}
				contentContainerStyle={[
					styles.contentContainer,
					{ paddingBottom: insets.bottom + theme.spacing.lg },
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* Title Input */}
				<View style={styles.inputSection}>
					<Text style={styles.inputLabel}>Título *</Text>
					<TextInput
						style={styles.titleInput}
						value={title}
						onChangeText={setTitle}
						placeholder="Ingresa el título de la publicación"
						placeholderTextColor={theme.colors.muted}
						multiline
					/>
				</View>

				{/* Content Input */}
				<View style={styles.inputSection}>
					<Text style={styles.inputLabel}>Contenido *</Text>
					<TextInput
						style={styles.contentInput}
						value={content}
						onChangeText={setContent}
						placeholder="Escribe el contenido de la publicación..."
						placeholderTextColor={theme.colors.muted}
						multiline
						textAlignVertical="top"
					/>
				</View>

				{/* Media Manager - Only show for existing posts */}
				{isEditing && (
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Archivos Multimedia</Text>
						<MediaManager
							mediaFiles={mediaFiles}
							onMediaFilesChange={setMediaFiles}
						/>
					</View>
				)}

				{/* Publication Status - Only show for existing posts */}
				{isEditing && (
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Estado de Publicación</Text>
						<View style={styles.publishSection}>
							<TouchableOpacity
								style={[
									styles.publishOption,
									!published && styles.publishOptionSelected,
								]}
								onPress={() => setPublished(false)}
								activeOpacity={1}
							>
								<View style={styles.publishOptionContent}>
									<Ionicons
										name="document-outline"
										size={20}
										color={!published ? theme.colors.white : theme.colors.text}
									/>
									<View style={styles.publishOptionText}>
										<Text
											style={[
												styles.publishOptionTitle,
												!published && styles.publishOptionTitleSelected,
											]}
										>
											Borrador
										</Text>
										<Text
											style={[
												styles.publishOptionSubtitle,
												!published && styles.publishOptionSubtitleSelected,
											]}
										>
											Guardar sin publicar
										</Text>
									</View>
								</View>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.publishOption,
									published && styles.publishOptionSelected,
								]}
								onPress={() => setPublished(true)}
								activeOpacity={1}
							>
								<View style={styles.publishOptionContent}>
									<Ionicons
										name="globe-outline"
										size={20}
										color={published ? theme.colors.white : theme.colors.text}
									/>
									<View style={styles.publishOptionText}>
										<Text
											style={[
												styles.publishOptionTitle,
												published && styles.publishOptionTitleSelected,
											]}
										>
											Publicar
										</Text>
										<Text
											style={[
												styles.publishOptionSubtitle,
												published && styles.publishOptionSubtitleSelected,
											]}
										>
											Visible para representantes
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						</View>
					</View>
				)}

				{/* Create Draft Button for new posts */}
				{!isEditing && (
					<View style={styles.createDraftSection}>
						<TouchableOpacity
							style={[
								styles.createDraftButton,
								!canCreateDraft && styles.createDraftButtonDisabled,
							]}
							onPress={handleCreateDraft}
							disabled={!canCreateDraft}
							activeOpacity={0.7}
						>
							<Ionicons
								name="document-text"
								size={20}
								color={canCreateDraft ? theme.colors.white : theme.colors.muted}
							/>
							<Text
								style={[
									styles.createDraftButtonText,
									!canCreateDraft && styles.createDraftButtonTextDisabled,
								]}
							>
								{isBusy ? "Creando Borrador..." : "Crear Borrador"}
							</Text>
						</TouchableOpacity>
						<Text style={styles.createDraftHint}>
							Podrás agregar multimedia y configurar la publicación después de
							crear el borrador
						</Text>
					</View>
				)}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 2000, // Higher than SocialPostModal's 1000
	},
	headerContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	backButton: {
		marginRight: theme.spacing.md,
		padding: theme.spacing.xs,
	},
	headerInfo: {
		flex: 1,
	},
	headerTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		color: theme.colors.text,
		fontWeight: "600",
	},
	headerSubtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginTop: 2,
	},
	saveButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: theme.radius.md,
	},
	saveButtonDisabled: {
		backgroundColor: theme.colors.border,
	},
	saveButtonText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
	},
	saveButtonTextDisabled: {
		color: theme.colors.muted,
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: theme.spacing.lg,
	},
	inputSection: {
		marginBottom: theme.spacing.lg,
	},
	inputLabel: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	titleInput: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		minHeight: 60,
		maxHeight: 120,
	},
	contentInput: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		minHeight: 120,
		maxHeight: 200,
	},
	publishSection: {
		flexDirection: "row",
		gap: theme.spacing.sm,
	},
	publishOption: {
		flex: 1,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		padding: theme.spacing.md,
	},
	publishOptionSelected: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	publishOptionContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	publishOptionText: {
		marginLeft: theme.spacing.sm,
		flex: 1,
	},
	publishOptionTitle: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
	},
	publishOptionTitleSelected: {
		color: theme.colors.white,
	},
	publishOptionSubtitle: {
		fontSize: 12,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		marginTop: 2,
	},
	publishOptionSubtitleSelected: {
		color: theme.colors.white,
		opacity: 0.8,
	},
	createDraftSection: {
		marginTop: theme.spacing.lg,
		alignItems: "center",
	},
	createDraftButton: {
		backgroundColor: theme.colors.primary,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderRadius: theme.radius.md,
		width: "100%",
		marginBottom: theme.spacing.sm,
	},
	createDraftButtonDisabled: {
		backgroundColor: theme.colors.border,
	},
	createDraftButtonText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		marginLeft: theme.spacing.xs,
	},
	createDraftButtonTextDisabled: {
		color: theme.colors.muted,
	},
	createDraftHint: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		textAlign: "center",
		lineHeight: 20,
	},
})
