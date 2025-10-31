import { Ionicons } from "@expo/vector-icons"
import { Directory, File, Paths } from "expo-file-system/next"
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
	onClose: () => void
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
	visible,
	videoUrl,
	onClose,
}) => {
	const [isLoading, setIsLoading] = useState(true)
	const [localUri, setLocalUri] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [downloadProgress, setDownloadProgress] = useState(0)
	const [isSharing, setIsSharing] = useState(false)
	const abortControllerRef = React.useRef<AbortController | null>(null)
	const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

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
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
				abortControllerRef.current = null
			}

			// Clear progress interval
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current)
				progressIntervalRef.current = null
			}

			// Stop and release video player
			if (player) {
				player.pause()
				player.replace("")
			}

			// Reset state
			setIsLoading(true)
			setLocalUri(null)
			setError(null)
			setDownloadProgress(0)
		}
	}, [visible, videoUrl])

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

		// Create new AbortController for this download
		abortControllerRef.current = new AbortController()

		try {
			// Generate a unique filename based on the URL
			const filename = videoUrl.split("/").pop()?.split("?")[0] || "video.mp4"

			// Create file path in cache directory using new API
			const cacheDir = new Directory(Paths.cache)
			const videoFile = new File(cacheDir, filename)

			// Check if file already exists (exists is a boolean property, not a function)
			if (videoFile.exists) {
				setLocalUri(videoFile.uri)
				setIsLoading(false)
				return
			}

			// Simulate progress with interval while downloading
			let simulatedProgress = 0
			progressIntervalRef.current = setInterval(() => {
				simulatedProgress += 5
				if (simulatedProgress <= 90) {
					setDownloadProgress(simulatedProgress)
				}
			}, 200)

			// Download the video using fetch with abort signal
			const response = await fetch(videoUrl, {
				signal: abortControllerRef.current.signal,
			})

			if (!response.ok) {
				if (progressIntervalRef.current) {
					clearInterval(progressIntervalRef.current)
					progressIntervalRef.current = null
				}
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			// Convert response to ArrayBuffer, then to Uint8Array
			const arrayBuffer = await response.arrayBuffer()
			const uint8Array = new Uint8Array(arrayBuffer)

			// Clear progress interval
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current)
				progressIntervalRef.current = null
			}
			setDownloadProgress(100)

			// Write the downloaded content to the file
			videoFile.write(uint8Array)

			setLocalUri(videoFile.uri)
			setIsLoading(false)
		} catch (err: any) {
			// Don't show error if request was aborted (user closed modal)
			if (err.name === "AbortError") {
				console.log("Video download cancelled")
				return
			}

			console.error("Error downloading video:", err)
			setError("No se pudo descargar el video")
			setIsLoading(false)
			Alert.alert("Error", "No se pudo descargar el video", [{ text: "OK" }])
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
									<Text style={styles.progressText}>{downloadProgress}%</Text>
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
