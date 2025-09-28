import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native"
import { theme } from "../../helpers/theme"
import { MediaFile } from "./PostEditor"

interface MediaManagerProps {
	mediaFiles: MediaFile[]
	onMediaFilesChange: (files: MediaFile[]) => void
}

export const MediaManager: React.FC<MediaManagerProps> = ({
	mediaFiles,
	onMediaFilesChange,
}) => {
	const [editingCaption, setEditingCaption] = useState<string | null>(null)
	const [captionText, setCaptionText] = useState("")

	const handleAddMedia = () => {
		// TODO: Implement image/video picker
		Alert.alert(
			"Agregar Multimedia",
			"Selecciona el tipo de archivo",
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Foto",
					onPress: () => handleImagePicker(),
				},
				{
					text: "Video",
					onPress: () => handleVideoPicker(),
				},
			]
		)
	}

	const handleImagePicker = () => {
		// TODO: Implement image picker using expo-image-picker
		// For now, add a placeholder
		const newFile: MediaFile = {
			uri: "https://via.placeholder.com/300x200.png?text=Nueva+Imagen",
			type: "image",
			caption: "",
		}
		onMediaFilesChange([...mediaFiles, newFile])
	}

	const handleVideoPicker = () => {
		// TODO: Implement video picker using expo-image-picker
		// For now, add a placeholder
		const newFile: MediaFile = {
			uri: "https://via.placeholder.com/300x200.png?text=Nuevo+Video",
			type: "video",
			caption: "",
		}
		onMediaFilesChange([...mediaFiles, newFile])
	}

	const handleRemoveMedia = (index: number) => {
		Alert.alert(
			"Eliminar Archivo",
			"¿Estás seguro de que quieres eliminar este archivo?",
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Eliminar",
					style: "destructive",
					onPress: () => {
						const updatedFiles = mediaFiles.filter((_, i) => i !== index)
						onMediaFilesChange(updatedFiles)
					},
				},
			]
		)
	}

	const handleEditCaption = (index: number, currentCaption: string) => {
		setEditingCaption(mediaFiles[index].uri)
		setCaptionText(currentCaption)
	}

	const handleSaveCaption = (index: number) => {
		const updatedFiles = [...mediaFiles]
		updatedFiles[index] = {
			...updatedFiles[index],
			caption: captionText,
		}
		onMediaFilesChange(updatedFiles)
		setEditingCaption(null)
		setCaptionText("")
	}

	const handleCancelCaption = () => {
		setEditingCaption(null)
		setCaptionText("")
	}

	return (
		<View style={styles.container}>
			{/* Media Files Grid */}
			<View style={styles.mediaGrid}>
				{mediaFiles.map((file, index) => (
					<View key={`${file.uri}-${index}`} style={styles.mediaItem}>
						{/* Media Preview */}
						<View style={styles.mediaPreview}>
							<Image
								source={{ uri: file.uri }}
								style={styles.mediaImage}
								resizeMode="cover"
							/>
							{file.type === "video" && (
								<View style={styles.videoOverlay}>
									<Ionicons
										name="play-circle"
										size={32}
										color={theme.colors.white}
									/>
								</View>
							)}
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => handleRemoveMedia(index)}
							>
								<Ionicons
									name="close-circle"
									size={24}
									color={theme.colors.danger}
								/>
							</TouchableOpacity>
						</View>

						{/* Caption Section */}
						<View style={styles.captionSection}>
							{editingCaption === file.uri ? (
								<View style={styles.captionEditor}>
									<TextInput
										style={styles.captionInput}
										value={captionText}
										onChangeText={setCaptionText}
										placeholder="Descripción opcional..."
										placeholderTextColor={theme.colors.muted}
										multiline
										maxLength={200}
									/>
									<View style={styles.captionActions}>
										<TouchableOpacity
											style={styles.captionActionButton}
											onPress={handleCancelCaption}
										>
											<Text style={styles.captionActionCancel}>Cancelar</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={[
												styles.captionActionButton,
												styles.captionActionSave,
											]}
											onPress={() => handleSaveCaption(index)}
										>
											<Text style={styles.captionActionSaveText}>Guardar</Text>
										</TouchableOpacity>
									</View>
								</View>
							) : (
								<TouchableOpacity
									style={styles.captionDisplay}
									onPress={() => handleEditCaption(index, file.caption || "")}
								>
									{file.caption ? (
										<Text style={styles.captionText} numberOfLines={2}>
											{file.caption}
										</Text>
									) : (
										<Text style={styles.captionPlaceholder}>
											Toca para agregar descripción
										</Text>
									)}
									<Ionicons
										name="pencil"
										size={16}
										color={theme.colors.muted}
									/>
								</TouchableOpacity>
							)}
						</View>
					</View>
				))}

				{/* Add Media Button */}
				<TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
					<Ionicons
						name="add"
						size={32}
						color={theme.colors.primary}
					/>
					<Text style={styles.addMediaText}>Agregar Archivo</Text>
				</TouchableOpacity>
			</View>

			{mediaFiles.length > 0 && (
				<Text style={styles.mediaInfo}>
					{mediaFiles.length} archivo{mediaFiles.length > 1 ? "s" : ""} agregado{mediaFiles.length > 1 ? "s" : ""}
				</Text>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: theme.spacing.sm,
	},
	mediaGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.sm,
	},
	mediaItem: {
		width: "48%",
		marginBottom: theme.spacing.sm,
	},
	mediaPreview: {
		position: "relative",
		borderRadius: theme.radius.md,
		overflow: "hidden",
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	mediaImage: {
		width: "100%",
		height: 120,
	},
	videoOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.3)",
	},
	removeButton: {
		position: "absolute",
		top: theme.spacing.xs,
		right: theme.spacing.xs,
		backgroundColor: theme.colors.white,
		borderRadius: 12,
	},
	captionSection: {
		marginTop: theme.spacing.xs,
	},
	captionEditor: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.sm,
		borderWidth: 1,
		borderColor: theme.colors.border,
		padding: theme.spacing.sm,
	},
	captionInput: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		minHeight: 40,
		textAlignVertical: "top",
	},
	captionActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: theme.spacing.xs,
		gap: theme.spacing.sm,
	},
	captionActionButton: {
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: 4,
		borderRadius: theme.radius.sm,
	},
	captionActionSave: {
		backgroundColor: theme.colors.primary,
	},
	captionActionCancel: {
		fontSize: 12,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
	},
	captionActionSaveText: {
		fontSize: 12,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
	},
	captionDisplay: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: theme.spacing.xs,
	},
	captionText: {
		fontSize: 12,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		flex: 1,
		marginRight: theme.spacing.xs,
	},
	captionPlaceholder: {
		fontSize: 12,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		flex: 1,
		marginRight: theme.spacing.xs,
		fontStyle: "italic",
	},
	addMediaButton: {
		width: "48%",
		height: 120,
		borderRadius: theme.radius.md,
		borderWidth: 2,
		borderColor: theme.colors.primary,
		borderStyle: "dashed",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
	},
	addMediaText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.primary,
		marginTop: theme.spacing.xs,
		textAlign: "center",
	},
	mediaInfo: {
		fontSize: 12,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		marginTop: theme.spacing.sm,
		textAlign: "center",
	},
})