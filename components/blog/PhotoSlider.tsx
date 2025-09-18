import React, { useState } from "react"
import {
	Image,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native"
import { BlogPostMedia } from "../../types/post"

interface PhotoSliderProps {
	media: BlogPostMedia[]
	postTitle: string
	onPress: () => void
}

const PhotoSlider: React.FC<PhotoSliderProps> = ({ media, onPress }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [containerWidth, setContainerWidth] = useState(0)

	if (!media || media.length === 0) {
		return null
	}

	// If only one image, show it without indicators
	if (media.length === 1) {
		return (
			<TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
				<Image
					source={{ uri: media[0].file_url }}
					style={styles.singleImage}
					onError={({ nativeEvent }) => {
						console.warn("Image loading error:", nativeEvent.error)
					}}
				/>
			</TouchableOpacity>
		)
	}

	const handleScroll = (event: any) => {
		const { contentOffset, layoutMeasurement } = event.nativeEvent
		const index = Math.round(contentOffset.x / layoutMeasurement.width)
		setCurrentIndex(index)
	}

	const handleContainerLayout = (event: any) => {
		const { width } = event.nativeEvent.layout
		setContainerWidth(width)
	}

	// Don't render until we have container width
	if (containerWidth === 0) {
		return (
			<View style={styles.container} onLayout={handleContainerLayout}>
				<View style={styles.loadingContainer} />
			</View>
		)
	}

	return (
		<View style={styles.container} onLayout={handleContainerLayout}>
			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={handleScroll}
				style={styles.scrollView}
				scrollEventThrottle={16}
				decelerationRate="fast"
				bounces={false}
				alwaysBounceHorizontal={false}
				directionalLockEnabled={true}
				automaticallyAdjustContentInsets={false}
				contentInsetAdjustmentBehavior="never"
			>
				{media.map((item) => (
					<TouchableOpacity
						key={item.id}
						style={[styles.imageContainer, { width: containerWidth }]}
						onPress={onPress}
						activeOpacity={0.9}
					>
						<Image
							source={{ uri: item.file_url }}
							style={styles.image}
							resizeMode="cover"
							onError={({ nativeEvent }) => {
								console.warn("Image loading error:", nativeEvent.error)
							}}
						/>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Indicators */}
			<View style={styles.indicatorContainer}>
				{media.map((_, index) => (
					<View
						key={index}
						style={[
							styles.indicator,
							{
								backgroundColor: index === currentIndex ? '#007AFF' : 'rgba(255, 255, 255, 0.5)',
							},
						]}
					/>
				))}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: "relative",
		overflow: "hidden",
	},
	scrollView: {
		width: "100%",
	},
	loadingContainer: {
		height: 200,
		backgroundColor: "#eaeaea",
	},
	singleImage: {
		width: "100%",
		height: 200,
		backgroundColor: "#eaeaea",
	},
	imageContainer: {
		height: 200,
		justifyContent: "center",
		alignItems: "center",
	},
	image: {
		width: "100%",
		height: "100%",
		backgroundColor: "#eaeaea",
	},
	indicatorContainer: {
		position: "absolute",
		bottom: 12,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	indicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginHorizontal: 4,
	},
})

export default PhotoSlider