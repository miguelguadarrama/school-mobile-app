import React, { memo, useCallback, useState } from "react"
import {
	Image,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native"
import { theme } from "../../helpers/theme"
import { BlogPostMedia } from "../../types/post"

interface PhotoSliderProps {
	media: BlogPostMedia[]
	postTitle: string
	onPress: () => void
}

const PhotoSlider: React.FC<PhotoSliderProps> = memo(({ media, onPress }) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [containerWidth, setContainerWidth] = useState(0)

	const handleScroll = useCallback((event: any) => {
		const { contentOffset, layoutMeasurement } = event.nativeEvent
		const index = Math.round(contentOffset.x / layoutMeasurement.width)
		setCurrentIndex(index)
	}, [])

	const handleContainerLayout = useCallback((event: any) => {
		const { width } = event.nativeEvent.layout
		setContainerWidth(width)
	}, [])

	if (!media || media.length === 0) {
		return null
	}

	// If only one image, show it without indicators
	if (media.length === 1) {
		return (
			<TouchableOpacity
				style={styles.container}
				onPress={onPress}
				activeOpacity={0.9}
			>
				<Image
					source={{ uri: media[0].file_url }}
					style={styles.singleImage}
					resizeMode="cover"
					loadingIndicatorSource={{
						uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
					}}
				/>
			</TouchableOpacity>
		)
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
				scrollEventThrottle={100}
				decelerationRate="fast"
				bounces={false}
				alwaysBounceHorizontal={false}
				directionalLockEnabled={true}
				automaticallyAdjustContentInsets={false}
				contentInsetAdjustmentBehavior="never"
				removeClippedSubviews={true}
				overScrollMode="never"
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
							loadingIndicatorSource={{
								uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
							}}
							progressiveRenderingEnabled={true}
							fadeDuration={200}
						/>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Indicators */}
			{media.length > 1 && (
				<View style={styles.indicatorContainer}>
					{media.map((_, index) => (
						<View
							key={index}
							style={[
								styles.indicator,
								{
									backgroundColor:
										index === currentIndex
											? theme.colors.primary
											: "rgba(255, 255, 255, 0.4)",
								},
							]}
						/>
					))}
				</View>
			)}
		</View>
	)
})

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
		borderRadius: theme.radius.sm,
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
		width: 12,
		height: 12,
		borderRadius: 6,
		marginHorizontal: 6,
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.8)",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 2,
	},
})

export default PhotoSlider
