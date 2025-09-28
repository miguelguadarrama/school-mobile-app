import { Ionicons } from "@expo/vector-icons"
import { ImageManipulator as ExpoImageManipulator, SaveFormat } from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
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

	const processImage = async (uri: string): Promise<string> => {
		try {
			// Load the image to read its intrinsic dimensions
			const originalImage = await ExpoImageManipulator.manipulate(uri).renderAsync()

			const { width, height } = originalImage
			const maxDimension = 1600
			const saveOptions = {
				compress: 0.8,
				format: SaveFormat.JPEG,
				base64: false,
			}

			if (width > maxDimension || height > maxDimension) {
				const scale = Math.min(maxDimension / width, maxDimension / height)
				const newWidth = Math.round(width * scale)
				const newHeight = Math.round(height * scale)

				const resizeContext = ExpoImageManipulator.manipulate(originalImage)
				resizeContext.resize({ width: newWidth, height: newHeight })
				const resizedImage = await resizeContext.renderAsync()
				const result = await resizedImage.saveAsync(saveOptions)
				return result.uri
			}

			const result = await originalImage.saveAsync(saveOptions)
			return result.uri
		} catch (error) {
			console.error("Error processing image:", error)
			return uri
		}
	}

	const handleAddMedia = () => {
		handleImagePicker()
	}

	const handleImagePicker = async () => {
		try {
			// Request gallery permissions
			const permissionResult =
				await ImagePicker.requestMediaLibraryPermissionsAsync()

			if (!permissionResult.granted) {
				Alert.alert(
					"Permisos Requeridos",
					"Necesitamos permisos para acceder a la galería de fotos",
					[{ text: "OK" }]
				)
				return
			}

			// Launch gallery picker
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: "images",
				allowsEditing: false, // Optional cropping
				quality: 0.8,
				allowsMultipleSelection: true,
				selectionLimit: 30 - mediaFiles.length, // Limit to 5 total files
			})

			if (!result.canceled && result.assets && result.assets.length > 0) {
				// Process each selected image
				const processedFiles: MediaFile[] = []

				for (const asset of result.assets) {
					try {
						// Process image: resize, compress, convert to JPEG, remove metadata
						const processedUri = await processImage(asset.uri)

						processedFiles.push({
							uri: processedUri,
							type: "image",
							caption: "",
						})
					} catch (error) {
						console.error("Error processing image:", error)
						// If processing fails, use original image
						processedFiles.push({
							uri: asset.uri,
							type: "image",
							caption: "",
						})
					}
				}

				onMediaFilesChange([...mediaFiles, ...processedFiles])
			}
		} catch (error) {
			console.error("Error picking image:", error)
			Alert.alert(
				"Error",
				"No se pudo seleccionar la imagen. Inténtalo de nuevo.",
				[{ text: "OK" }]
			)
		}
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
				<TouchableOpacity
					style={styles.addMediaButton}
					onPress={handleAddMedia}
				>
					<Ionicons name="add" size={32} color={theme.colors.primary} />
					<Text style={styles.addMediaText}>Agregar Fotos</Text>
				</TouchableOpacity>
			</View>

			{mediaFiles.length > 0 && (
				<Text style={styles.mediaInfo}>
					{mediaFiles.length} foto{mediaFiles.length > 1 ? "s" : ""} agregada
					{mediaFiles.length > 1 ? "s" : ""}
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
