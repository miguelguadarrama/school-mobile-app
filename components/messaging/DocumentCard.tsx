import { Ionicons } from "@expo/vector-icons"
import * as FileSystem from "expo-file-system"
import { getContentUriAsync } from "expo-file-system/legacy"
import * as IntentLauncher from "expo-intent-launcher"
import React, { useState } from "react"
import {
	ActivityIndicator,
	Alert,
	Linking,
	Platform,
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
			// Create file destination in cache directory
			const destination = new FileSystem.File(
				FileSystem.Paths.cache,
				fileName
			)

			// Download file to cache directory
			const file = await FileSystem.File.downloadFileAsync(
				fileUrl,
				destination,
				{ idempotent: true }
			)

			// Open file with default app based on platform
			if (Platform.OS === "android") {
				// On Android, use IntentLauncher to open the file
				const contentUri = await getContentUriAsync(file.uri)
				await IntentLauncher.startActivityAsync(
					"android.intent.action.VIEW",
					{
						data: contentUri,
						flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
						type: "application/pdf",
					}
				)
			} else {
				// On iOS, use Linking to open the file
				const canOpen = await Linking.canOpenURL(file.uri)
				if (canOpen) {
					await Linking.openURL(file.uri)
				} else {
					Alert.alert(
						"Error",
						"No se encontró una aplicación para abrir este documento",
						[{ text: "OK" }]
					)
				}
			}
		} catch (error) {
			console.error("Error downloading document:", error)
			Alert.alert(
				"Error",
				"Hubo un problema al descargar el archivo. Inténtalo de nuevo.",
				[{ text: "OK" }]
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
