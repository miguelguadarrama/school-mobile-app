// PhotoGridView.tsx
import React from "react"
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Dimensions,
	SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface PostMedia {
	Id: string
	file_url: string
	caption?: string
}

interface PhotoGridViewProps {
	media: PostMedia[]
	title: string
	onBack: () => void
	onPhotoPress: (index: number) => void
}

const { width: screenWidth } = Dimensions.get("window")
const spacing = 2

const PhotoGridView: React.FC<PhotoGridViewProps> = ({
	media,
	title,
	onBack,
	onPhotoPress,
}) => {
	// Calculate grid layout - 3 columns for mobile
	const cols = 3

	const imageSize = (screenWidth - spacing * (cols + 1)) / cols

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={onBack}>
					<Ionicons name="arrow-back" size={24} color="#333" />
				</TouchableOpacity>
				<Text style={styles.headerTitle} numberOfLines={1}>
					{title}
				</Text>
				<View style={styles.headerRight}>
					<Text style={styles.photoCount}>{media.length} fotos</Text>
				</View>
			</View>

			{/* Photo Grid */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.gridContainer}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.grid}>
					{media.map((item, index) => (
						<TouchableOpacity
							key={item.Id}
							style={[
								styles.gridItem,
								{
									width: imageSize,
									height: imageSize,
									marginLeft: spacing,
									marginBottom: spacing,
								},
							]}
							onPress={() => onPhotoPress(index)}
							activeOpacity={0.8}
						>
							<Image
								source={{ uri: item.file_url }}
								style={styles.gridImage}
								onError={({ nativeEvent }) => {
									console.warn("Image loading error:", nativeEvent.error)
								}}
							/>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#e1e1e1",
		backgroundColor: "#fff",
	},
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginLeft: 12,
	},
	headerRight: {
		marginLeft: 12,
	},
	photoCount: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	scrollView: {
		flex: 1,
	},
	gridContainer: {
		paddingTop: spacing,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: spacing,
	},
	gridItem: {
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: "#f5f5f5",
	},
	gridImage: {
		width: "100%",
		height: "100%",
		backgroundColor: "#eaeaea",
	},
})

export default PhotoGridView
