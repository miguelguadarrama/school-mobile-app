import { Ionicons } from "@expo/vector-icons"
import { Directory, File, Paths } from "expo-file-system/next"
import {
	createDownloadResumable,
	type DownloadProgressData,
	type DownloadResumable,
} from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"
import { VideoView, useVideoPlayer } from "expo-video"
import React, { useEffect, useState } from "react"
import {
	ActivityIndicator,
	Alert,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { theme } from "../../helpers/theme"

interface VideoPlayerModalProps {
	visible: boolean
	videoUrl: string | null
	videoSize?: number | null
	onClose: () => void
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
	visible,
	videoUrl,
	videoSize,
	onClose,
}) => {
	const [isLoading, setIsLoading] = useState(true)
	const [localUri, setLocalUri] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [downloadProgress, setDownloadProgress] = useState(0)
	const [downloadedBytes, setDownloadedBytes] = useState(0)
	const [totalBytes, setTotalBytes] = useState<number | null>(videoSize ?? null)
	const [isSharing, setIsSharing] = useState(false)
	const downloadTaskRef = React.useRef<DownloadResumable | null>(null)
	const totalBytesRef = React.useRef<number | null>(videoSize ?? null)
	const currentDownloadFileRef = React.useRef<File | null>(null)
	const downloadCompletedRef = React.useRef(false)

	useEffect(() => {
		const normalizedSize = videoSize ?? null
		totalBytesRef.current = normalizedSize
		setTotalBytes(normalizedSize)
	}, [videoSize])

	const clearPartialDownload = () => {
		const activeFile = currentDownloadFileRef.current
		if (!downloadCompletedRef.current && activeFile) {
			try {
				if (activeFile.exists) {
					activeFile.delete()
				}
			} catch (deleteError) {
				console.warn("Unable to delete partial video download", deleteError)
			}
		}
		currentDownloadFileRef.current = null
		downloadCompletedRef.current = false
	}

	// Create video player instance with the local URI
	const player = useVideoPlayer(localUri || "", (player) => {
		player.loop = false
		player.play()
	})

	useEffect(() => {
		if (visible && videoUrl) {
			downloadVideo()
		} else {
			// Clean up when modal closes
			// Cancel any ongoing download
			if (downloadTaskRef.current) {
				downloadTaskRef.current.cancelAsync().catch(() => {})
				downloadTaskRef.current = null
			}

			clearPartialDownload()

			// Stop and release video player
			if (player) {
				player.pause()
				void player.replaceAsync("").catch((replaceError: unknown) => {
					console.warn("Unable to clear video source", replaceError)
				})
			}

			// Reset state
			setIsLoading(true)
			setLocalUri(null)
			setError(null)
			setDownloadProgress(0)
			setDownloadedBytes(0)
			setTotalBytes(videoSize ?? null)
		}
	}, [visible, videoUrl, videoSize, player])

	useEffect(() => {
		// Update player source when localUri changes
		const updatePlayerSource = async () => {
			if (localUri && player) {
				await player.replaceAsync(localUri)
			}
		}
		updatePlayerSource()
	}, [localUri])

	const downloadVideo = async () => {
		if (!videoUrl) return

		setIsLoading(true)
		setError(null)
		setDownloadProgress(0)
		setDownloadedBytes(0)
		totalBytesRef.current = videoSize ?? null
		setTotalBytes(videoSize ?? null)
		currentDownloadFileRef.current = null
		downloadCompletedRef.current = false

		// Cancel previous task if any
		if (downloadTaskRef.current) {
			await downloadTaskRef.current.cancelAsync().catch(() => {})
			downloadTaskRef.current = null
		}

		try {
			// Generate a unique filename based on the URL
			const filename = videoUrl.split("/").pop()?.split("?")[0] || "video.mp4"

			// Create file path in cache directory using new API
			const cacheDir = new Directory(Paths.cache)
			const videoFile = new File(cacheDir, filename)

			// Check if file already exists (exists is a boolean property, not a function)
			if (videoFile.exists) {
				try {
					const fileInfo = videoFile.info()
					if (fileInfo?.exists === true && typeof fileInfo.size === "number") {
						setDownloadedBytes(fileInfo.size)
						totalBytesRef.current = fileInfo.size
						setTotalBytes(fileInfo.size)
					}
				} catch (infoError) {
					console.warn("Unable to read cached video info", infoError)
				}
				setDownloadProgress(100)
				setLocalUri(videoFile.uri)
				setIsLoading(false)
				downloadCompletedRef.current = true
				currentDownloadFileRef.current = null
				return
			}

			const progressCallback = (progress: DownloadProgressData) => {
				const bytesWritten = progress.totalBytesWritten
				setDownloadedBytes(bytesWritten)

				const expectedBytesFromServer =
					progress.totalBytesExpectedToWrite > 0
						? progress.totalBytesExpectedToWrite
						: null

				const resolvedTotalBytes =
					expectedBytesFromServer ?? totalBytesRef.current ?? videoSize ?? 0

				if (
					expectedBytesFromServer &&
					expectedBytesFromServer !== totalBytesRef.current
				) {
					totalBytesRef.current = expectedBytesFromServer
					setTotalBytes(expectedBytesFromServer)
				} else if (!totalBytesRef.current && videoSize) {
					totalBytesRef.current = videoSize
					setTotalBytes(videoSize)
				}

				if (resolvedTotalBytes > 0) {
					const percent = Math.min(
						100,
						Math.round((bytesWritten / resolvedTotalBytes) * 100)
					)
					setDownloadProgress(percent)
				}
			}

			const downloadTask = createDownloadResumable(
				videoUrl,
				videoFile.uri,
				undefined,
				progressCallback
			)

			currentDownloadFileRef.current = videoFile
			downloadCompletedRef.current = false
			downloadTaskRef.current = downloadTask

			const result = await downloadTask.downloadAsync()
			downloadTaskRef.current = null

			if (!result) {
				// Download was cancelled
				clearPartialDownload()
				return
			}

			setDownloadProgress(100)
			if (totalBytesRef.current) {
				setDownloadedBytes(totalBytesRef.current)
			}
			setLocalUri(result.uri)
			setIsLoading(false)
			downloadCompletedRef.current = true
			currentDownloadFileRef.current = null
		} catch (err: any) {
			// Don't show error if request was cancelled (user closed modal)
			const message = typeof err?.message === "string" ? err.message.toLowerCase() : ""
			if (message.includes("cancel") || message.includes("aborted")) {
				console.log("Video download cancelled")
				clearPartialDownload()
				return
			}

			console.error("Error downloading video:", err)
			setError("No se pudo descargar el video")
			setIsLoading(false)
			Alert.alert("Error", "No se pudo descargar el video", [{ text: "OK" }])
			clearPartialDownload()
		} finally {
			if (downloadTaskRef.current) {
				downloadTaskRef.current = null
			}
		}
	}

	const handleClose = () => {
		// Pause video before closing
		if (player) {
			player.pause()
		}
		onClose()
	}

	const shareVideo = async () => {
		if (!localUri) {
			Alert.alert("Error", "El video aún no se ha descargado.")
			return
		}

		try {
			setIsSharing(true)

			// Check if sharing is available
			const isAvailable = await Sharing.isAvailableAsync()
			if (!isAvailable) {
				Alert.alert(
					"Error",
					"La función de compartir no está disponible en este dispositivo."
				)
				return
			}

			// Get file extension from URL or default to mp4
			const fileExtension =
				videoUrl?.split(".").pop()?.split("?")[0].toLowerCase() || "mp4"

			// Share the video file using expo-sharing
			await Sharing.shareAsync(localUri, {
				mimeType: `video/${fileExtension}`,
				dialogTitle: "Compartir video de la escuela",
			})

			console.log("Video shared successfully")
		} catch (error) {
			console.error("Error sharing video:", error)
			Alert.alert("Error", "No se pudo compartir el video. Inténtalo de nuevo.")
		} finally {
			setIsSharing(false)
		}
	}

	const formatBytes = (bytes: number | null) => {
		if (!bytes || bytes <= 0) {
			return "0 B"
		}
		const units = ["B", "KB", "MB", "GB", "TB"] as const
		const exponent = Math.min(
			units.length - 1,
			Math.floor(Math.log(bytes) / Math.log(1024))
		)
		const value = bytes / Math.pow(1024, exponent)
		return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
	}

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="fade"
			onRequestClose={handleClose}
		>
			<View style={styles.overlay}>
				<SafeAreaView edges={["top"]} style={styles.container}>
					<View style={styles.header}>
						<TouchableOpacity style={styles.closeButton} onPress={handleClose}>
							<Ionicons name="close" size={28} color={theme.colors.white} />
						</TouchableOpacity>
						<View style={styles.spacer} />
						<TouchableOpacity
							style={styles.shareButton}
							onPress={shareVideo}
							disabled={isSharing || isLoading || !!error}
						>
							{isSharing ? (
								<ActivityIndicator size="small" color={theme.colors.white} />
							) : (
								<Ionicons
									name="share-outline"
									size={24}
									color={theme.colors.white}
								/>
							)}
						</TouchableOpacity>
					</View>

					<View style={styles.content}>
						{isLoading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={theme.colors.primary} />
								<Text style={styles.loadingText}>Descargando video...</Text>
								{downloadProgress > 0 && (
									<Text style={styles.progressText}>
										{downloadProgress}%
										{totalBytes
											? ` (${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)})`
										: ""}
									</Text>
								)}
							</View>
						) : error ? (
							<View style={styles.errorContainer}>
								<Ionicons
									name="alert-circle"
									size={64}
									color={theme.colors.danger}
								/>
								<Text style={styles.errorText}>{error}</Text>
								<TouchableOpacity
									style={styles.retryButton}
									onPress={downloadVideo}
								>
									<Text style={styles.retryButtonText}>Reintentar</Text>
								</TouchableOpacity>
							</View>
						) : localUri ? (
							<VideoView
								player={player}
								style={styles.video}
								allowsPictureInPicture
								nativeControls
							/>
						) : null}
					</View>
				</SafeAreaView>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.9)",
	},
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
	},
	closeButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 22,
	},
	spacer: {
		flex: 1,
	},
	shareButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 22,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	video: {
		width: "100%",
		height: "100%",
	},
	loadingContainer: {
		alignItems: "center",
		gap: theme.spacing.lg,
	},
	loadingText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.white,
		textAlign: "center",
	},
	progressText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.primary,
		textAlign: "center",
	},
	errorContainer: {
		alignItems: "center",
		padding: theme.spacing.xl,
		gap: theme.spacing.lg,
	},
	errorText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.white,
		textAlign: "center",
		maxWidth: 280,
	},
	retryButton: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		borderRadius: theme.radius.md,
	},
	retryButtonText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
	},
})
