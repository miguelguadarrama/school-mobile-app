import { Ionicons } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import React, { useState } from "react"
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
	formatFileSize,
	MAX_FILE_SIZES,
	processImage,
	processVideo,
} from "../../helpers/fileCompression"
import { theme } from "../../helpers/theme"
import { AttachmentData } from "../../types/chat"

interface MessageInputProps {
	onSendMessage: (content: string, attachment?: AttachmentData) => Promise<void>
	keyboardHeight: number
	placeholder?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
	onSendMessage,
	keyboardHeight,
	placeholder = "Escribe un mensaje...",
}) => {
	const [messageText, setMessageText] = useState("")
	const [isSending, setIsSending] = useState(false)
	const [selectedFile, setSelectedFile] = useState<AttachmentData | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const [compressionProgress, setCompressionProgress] = useState(0)
	const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)

	const handleSend = async () => {
		// If attachment is selected, send attachment only (no text)
		// Otherwise, require text
		if (selectedFile) {
			// Send attachment without text
			if (isSending) return
			setIsSending(true)
			try {
				await onSendMessage("archivo", selectedFile)
				setMessageText("")
				setSelectedFile(null)
			} catch (error) {
				console.error("Failed to send message:", error)
			} finally {
				setIsSending(false)
			}
		} else {
			// Send text only
			if (!messageText.trim() || isSending) return
			setIsSending(true)
			try {
				await onSendMessage(messageText.trim(), undefined)
				setMessageText("")
			} catch (error) {
				console.error("Failed to send message:", error)
			} finally {
				setIsSending(false)
			}
		}
	}

	const handlePickPhoto = async () => {
		setShowAttachmentMenu(false)

		try {
			// Request permissions
			const permissionResult =
				await ImagePicker.requestMediaLibraryPermissionsAsync()
			if (!permissionResult.granted) {
				Alert.alert(
					"Permisos Requeridos",
					"Necesitamos permisos para acceder a la galería"
				)
				return
			}

			// Pick image
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: false,
				quality: 0.8,
				allowsMultipleSelection: false,
			})

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const asset = result.assets[0]

				// Validate file size
				if (asset.fileSize && asset.fileSize > MAX_FILE_SIZES.photo) {
					Alert.alert(
						"Archivo muy grande",
						`El tamaño máximo para fotos es ${formatFileSize(
							MAX_FILE_SIZES.photo
						)}`
					)
					return
				}

				setIsProcessing(true)

				// Process image
				const processedUri = await processImage(asset.uri)

				setSelectedFile({
					type: "photo",
					localUri: processedUri,
					mimeType: "image/jpeg",
					fileName: asset.fileName || "photo.jpg",
					fileSize: asset.fileSize || 0,
				})

				setIsProcessing(false)
			}
		} catch (error) {
			console.error("Error picking photo:", error)
			Alert.alert("Error", "No se pudo seleccionar la foto")
			setIsProcessing(false)
		}
	}

	const handlePickVideo = async () => {
		setShowAttachmentMenu(false)

		try {
			// Request permissions
			const permissionResult =
				await ImagePicker.requestMediaLibraryPermissionsAsync()
			if (!permissionResult.granted) {
				Alert.alert(
					"Permisos Requeridos",
					"Necesitamos permisos para acceder a la galería"
				)
				return
			}

			// Pick video
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["videos"],
				allowsEditing: false,
				videoMaxDuration: 300, // 5 minutes
			})

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const asset = result.assets[0]

				// Validate file size
				if (asset.fileSize && asset.fileSize > MAX_FILE_SIZES.video) {
					Alert.alert(
						"Archivo muy grande",
						`El tamaño máximo para videos es ${formatFileSize(
							MAX_FILE_SIZES.video
						)}`
					)
					return
				}

				setIsProcessing(true)

				// Process video (compress + generate thumbnail)
				const {
					uri: compressedUri,
					fileSize,
					thumbnailUri,
				} = await processVideo(asset.uri, (progress) =>
					setCompressionProgress(progress)
				)

				setSelectedFile({
					type: "video",
					localUri: compressedUri,
					mimeType: asset.mimeType || "video/mp4",
					fileName: asset.fileName || "video.mp4",
					fileSize: fileSize || asset.fileSize || 0,
					thumbnailUri: thumbnailUri,
				})

				setIsProcessing(false)
				setCompressionProgress(0)
			}
		} catch (error) {
			console.error("Error picking video:", error)
			Alert.alert("Error", "No se pudo seleccionar el video")
			setIsProcessing(false)
			setCompressionProgress(0)
		}
	}

	const handlePickDocument = async () => {
		setShowAttachmentMenu(false)

		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: "application/pdf",
				multiple: false,
				copyToCacheDirectory: true,
			})

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const asset = result.assets[0]

				// Validate file size
				if (asset.size && asset.size > MAX_FILE_SIZES.document) {
					Alert.alert(
						"Archivo muy grande",
						`El tamaño máximo para documentos es ${formatFileSize(
							MAX_FILE_SIZES.document
						)}`
					)
					return
				}

				setSelectedFile({
					type: "document",
					localUri: asset.uri,
					mimeType: asset.mimeType || "application/pdf",
					fileName: asset.name,
					fileSize: asset.size || 0,
				})
			}
		} catch (error) {
			console.error("Error picking document:", error)
			Alert.alert("Error", "No se pudo seleccionar el documento")
		}
	}

	const handleRemoveFile = () => {
		setSelectedFile(null)
	}

	const renderFilePreview = () => {
		if (!selectedFile) return null

		switch (selectedFile.type) {
			case "photo":
				return (
					<View style={styles.previewContainer}>
						<Image
							source={{ uri: selectedFile.localUri }}
							style={styles.previewImage}
							resizeMode="cover"
						/>
						<TouchableOpacity
							style={styles.removePreviewButton}
							onPress={handleRemoveFile}
						>
							<Ionicons
								name="close-circle"
								size={24}
								color={theme.colors.danger}
							/>
						</TouchableOpacity>
					</View>
				)

			case "video":
				return (
					<View style={styles.previewContainer}>
						<Image
							source={{
								uri: selectedFile.thumbnailUri || selectedFile.localUri,
							}}
							style={styles.previewImage}
							resizeMode="cover"
						/>
						<View style={styles.videoPreviewOverlay}>
							<Ionicons name="videocam" size={24} color={theme.colors.white} />
						</View>
						<TouchableOpacity
							style={styles.removePreviewButton}
							onPress={handleRemoveFile}
						>
							<Ionicons
								name="close-circle"
								size={24}
								color={theme.colors.danger}
							/>
						</TouchableOpacity>
					</View>
				)

			case "document":
				return (
					<View style={styles.previewContainer}>
						<View style={styles.documentPreview}>
							<Ionicons
								name="document-text"
								size={32}
								color={theme.colors.primary}
							/>
							<Text style={styles.documentName} numberOfLines={1}>
								{selectedFile.fileName}
							</Text>
							<Text style={styles.documentSize}>
								{formatFileSize(selectedFile.fileSize)}
							</Text>
						</View>
						<TouchableOpacity
							style={styles.removePreviewButton}
							onPress={handleRemoveFile}
						>
							<Ionicons
								name="close-circle"
								size={24}
								color={theme.colors.danger}
							/>
						</TouchableOpacity>
					</View>
				)

			default:
				return null
		}
	}

	const canSend = (messageText.trim() || selectedFile) && !isSending

	return (
		<>
			<View
				style={[
					styles.inputContainer,
					keyboardHeight > 0 && {
						position: "absolute",
						bottom: keyboardHeight + (Platform.OS === "ios" ? 0 : 48),
						left: 0,
						right: 0,
					},
				]}
			>
				<SafeAreaView edges={keyboardHeight > 0 ? [] : ["bottom"]}>
					{/* File Preview - when file selected, replace text input */}
					{selectedFile ? (
						<View style={styles.previewWrapper}>
							{renderFilePreview()}
							{/* Send button for attachment */}
							<TouchableOpacity
								style={[styles.sendAttachmentButton, styles.sendButtonActive]}
								onPress={handleSend}
								disabled={isSending}
							>
								<Ionicons name="send" size={20} color={theme.colors.white} />
								<Text style={styles.sendAttachmentButtonText}>
									{isSending ? "Enviando..." : "Enviar archivo"}
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View style={styles.inputWrapper}>
							{/* Attachment Button */}
							<TouchableOpacity
								style={styles.attachButton}
								onPress={() => setShowAttachmentMenu(true)}
								disabled={isSending || isProcessing}
							>
								<Ionicons
									name="attach"
									size={24}
									color={theme.colors.primary}
								/>
							</TouchableOpacity>

							{/* Text Input */}
							<TextInput
								style={styles.textInput}
								placeholder={placeholder}
								placeholderTextColor={theme.colors.muted}
								multiline
								value={messageText}
								onChangeText={setMessageText}
								onSubmitEditing={handleSend}
								editable={!isSending && !isProcessing}
							/>

							{/* Send Button */}
							<TouchableOpacity
								style={[
									styles.sendButton,
									canSend ? styles.sendButtonActive : null,
								]}
								onPress={handleSend}
								disabled={!canSend}
							>
								<Ionicons
									name="send"
									size={20}
									color={canSend ? theme.colors.white : theme.colors.muted}
								/>
							</TouchableOpacity>
						</View>
					)}
				</SafeAreaView>
			</View>

			{/* Attachment Menu Modal */}
			<Modal
				visible={showAttachmentMenu}
				transparent
				animationType="fade"
				onRequestClose={() => setShowAttachmentMenu(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setShowAttachmentMenu(false)}
				>
					<View style={styles.attachmentMenu}>
						<TouchableOpacity
							style={styles.attachmentOption}
							onPress={handlePickPhoto}
						>
							<Ionicons name="image" size={24} color={theme.colors.primary} />
							<Text style={styles.attachmentOptionText}>Foto</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.attachmentOption}
							onPress={handlePickVideo}
						>
							<Ionicons
								name="videocam"
								size={24}
								color={theme.colors.primary}
							/>
							<Text style={styles.attachmentOptionText}>Video</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.attachmentOption}
							onPress={handlePickDocument}
						>
							<Ionicons
								name="document-text"
								size={24}
								color={theme.colors.primary}
							/>
							<Text style={styles.attachmentOptionText}>Documento</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>

			{/* Processing/Compression Modal */}
			<Modal visible={isProcessing} transparent animationType="fade">
				<View style={styles.processingOverlay}>
					<View style={styles.processingContent}>
						<ActivityIndicator size="large" color={theme.colors.primary} />
						<Text style={styles.processingText}>
							{compressionProgress > 0
								? `Comprimiendo video... ${compressionProgress}%`
								: "Procesando archivo..."}
						</Text>
					</View>
				</View>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	inputContainer: {
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "flex-end",
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.sm,
		paddingBottom: theme.spacing.sm,
	},
	attachButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.background,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.xs,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	textInput: {
		flex: 1,
		backgroundColor: theme.colors.background,
		borderRadius: 20,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		marginRight: theme.spacing.sm,
		maxHeight: 50,
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.text,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.background,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	sendButtonActive: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	previewWrapper: {
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.sm,
		paddingBottom: theme.spacing.sm,
	},
	sendAttachmentButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.primary,
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderRadius: theme.radius.md,
		marginTop: theme.spacing.sm,
	},
	sendAttachmentButtonText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.white,
		marginLeft: theme.spacing.xs,
	},
	previewContainer: {
		position: "relative",
		backgroundColor: theme.colors.background,
		borderRadius: theme.radius.md,
		overflow: "hidden",
	},
	previewImage: {
		width: "100%",
		height: 120,
		borderRadius: theme.radius.md,
	},
	videoPreviewOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.3)",
	},
	documentPreview: {
		padding: theme.spacing.md,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 100,
	},
	documentName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.text,
		marginTop: theme.spacing.xs,
		textAlign: "center",
	},
	documentSize: {
		fontFamily: theme.typography.family.regular,
		fontSize: 12,
		color: theme.colors.muted,
		marginTop: 4,
	},
	removePreviewButton: {
		position: "absolute",
		top: theme.spacing.xs,
		right: theme.spacing.xs,
		backgroundColor: theme.colors.white,
		borderRadius: 12,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	attachmentMenu: {
		backgroundColor: theme.colors.surface,
		borderTopLeftRadius: theme.radius.lg,
		borderTopRightRadius: theme.radius.lg,
		paddingTop: theme.spacing.lg,
		paddingBottom: theme.spacing.xl,
		paddingHorizontal: theme.spacing.lg,
	},
	attachmentOption: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	attachmentOptionText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		marginLeft: theme.spacing.md,
	},
	processingOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
	processingContent: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		padding: theme.spacing.xl,
		alignItems: "center",
		minWidth: 200,
	},
	processingText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		marginTop: theme.spacing.md,
		textAlign: "center",
	},
})
