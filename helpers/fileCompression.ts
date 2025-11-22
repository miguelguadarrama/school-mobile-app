import { File } from "expo-file-system"
import {
	ImageManipulator as ExpoImageManipulator,
	SaveFormat,
} from "expo-image-manipulator"
import { Video, createVideoThumbnail } from "react-native-compressor"

/**
 * Process and compress an image file
 * - Resize to max 1600px dimension
 * - Compress to 80% JPEG quality
 */
export const processImage = async (uri: string): Promise<string> => {
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

/**
 * Generate a thumbnail from a video file
 */
export const generateVideoThumbnail = async (
	videoUri: string
): Promise<string | null> => {
	try {
		// Generate thumbnail from video
		const result = await createVideoThumbnail(videoUri)
		return result.path
	} catch (error) {
		console.error("Error generating video thumbnail:", error)
		return null
	}
}

/**
 * Process and compress a video file
 * - Compress video using react-native-compressor
 * - Generate thumbnail
 * Returns compressed video URI, file size, and thumbnail URI
 */
export const processVideo = async (
	uri: string,
	onProgress?: (progress: number) => void
): Promise<{ uri: string; fileSize?: number; thumbnailUri?: string }> => {
	try {
		// Compress video to reduce file size
		const compressedUri = await Video.compress(
			uri,
			{
				compressionMethod: "auto",
				minimumFileSizeForCompress: 2, // Only compress if > 2MB
			},
			(progress) => {
				// Update compression progress (0-1 scale)
				if (onProgress) {
					onProgress(Math.round(progress * 100))
				}
			}
		)

		// Get the actual file size of the compressed video using new File API
		const file = new File(compressedUri)
		const fileSize = file.size

		// Generate thumbnail from the compressed video
		const thumbnailUri = await generateVideoThumbnail(compressedUri)

		return {
			uri: compressedUri,
			fileSize,
			thumbnailUri: thumbnailUri || undefined,
		}
	} catch (error) {
		console.error("Error compressing video:", error)
		// If compression fails, return original URI
		return { uri }
	}
}

/**
 * Upload a file to Azure Blob Storage using SAS URL
 */
export const uploadFileToSas = async (
	fileUri: string,
	sasUrl: string
): Promise<boolean> => {
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

/**
 * Format file size in bytes to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * File size limits in bytes
 */
export const MAX_FILE_SIZES = {
	photo: 10 * 1024 * 1024, // 10 MB (before compression)
	video: 50 * 1024 * 1024, // 50 MB (before compression)
	document: 25 * 1024 * 1024, // 25 MB
}

/**
 * Allowed MIME types
 */
export const ALLOWED_MIME_TYPES = {
	photo: ["image/jpeg", "image/jpg", "image/png", "image/heic"],
	video: ["video/mp4", "video/mov", "video/quicktime"],
	document: ["application/pdf"],
}
