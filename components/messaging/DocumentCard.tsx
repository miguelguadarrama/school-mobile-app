import { Ionicons } from "@expo/vector-icons"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import React, { useState } from "react"
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { formatFileSize } from "../../helpers/fileCompression"
import { theme } from "../../helpers/theme"

interface DocumentCardProps {
	fileName: string
	fileSize?: number
	fileUrl: string
	isOptimistic?: boolean
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
	fileName,
	fileSize,
	fileUrl,
	isOptimistic = false,
}) => {
	const [isDownloading, setIsDownloading] = useState(false)

	const handleDownload = async () => {
		if (isOptimistic) {
			Alert.alert("Enviando", "El archivo se está subiendo. Espera un momento.")
			return
		}

		setIsDownloading(true)
		try {
			// Check if sharing is available
			const isAvailable = await Sharing.isAvailableAsync()
			if (!isAvailable) {
				Alert.alert(
					"Error",
					"No se puede compartir archivos en este dispositivo"
				)
				return
			}

			// Download file to cache directory
			const fileUri = `${FileSystem.cacheDirectory}${fileName}`
			const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri)

			if (downloadResult.status === 200) {
				// Share/Open the downloaded file
				await Sharing.shareAsync(downloadResult.uri, {
					UTI: "public.item",
					mimeType: "application/pdf",
				})
			} else {
				Alert.alert("Error", "No se pudo descargar el archivo")
			}
		} catch (error) {
			console.error("Error downloading document:", error)
			Alert.alert(
				"Error",
				"Hubo un problema al descargar el archivo. Inténtalo de nuevo."
			)
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<TouchableOpacity
			style={[styles.card, isOptimistic && styles.cardOptimistic]}
			onPress={handleDownload}
			disabled={isDownloading || isOptimistic}
			activeOpacity={0.7}
		>
			<View style={styles.iconContainer}>
				<Ionicons
					name="document-text"
					size={32}
					color={theme.colors.primary}
				/>
			</View>

			<View style={styles.infoContainer}>
				<Text style={styles.fileName} numberOfLines={2}>
					{fileName}
				</Text>
				{fileSize && (
					<Text style={styles.fileSize}>{formatFileSize(fileSize)}</Text>
				)}
			</View>

			<View style={styles.actionContainer}>
				{isDownloading ? (
					<ActivityIndicator size="small" color={theme.colors.primary} />
				) : isOptimistic ? (
					<ActivityIndicator size="small" color={theme.colors.muted} />
				) : (
					<Ionicons
						name="download-outline"
						size={24}
						color={theme.colors.primary}
					/>
				)}
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		padding: theme.spacing.sm,
		minHeight: 80,
	},
	cardOptimistic: {
		opacity: 0.7,
	},
	iconContainer: {
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.background,
		borderRadius: theme.radius.sm,
		marginRight: theme.spacing.sm,
	},
	infoContainer: {
		flex: 1,
		justifyContent: "center",
	},
	fileName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.text,
		marginBottom: 4,
	},
	fileSize: {
		fontFamily: theme.typography.family.regular,
		fontSize: 12,
		color: theme.colors.muted,
	},
	actionContainer: {
		width: 32,
		height: 32,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: theme.spacing.sm,
	},
})
