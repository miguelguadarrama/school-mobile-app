import React, { useEffect, useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withTiming,
} from "react-native-reanimated"
import { displayName } from "../../helpers/students"
import { theme } from "../../helpers/theme"
import { student } from "../../types/students"
import SchoolCard from "../SchoolCard"
import Balloon from "./Balloon"

interface BirthdayCardProps {
	student: student
}

interface BalloonConfig {
	id: number
	size: number
	color: string
	duration: number
	delay: number
	startX: number
	opacity: number
}

const BALLOON_COLORS = [
	"#FF6B9D",
	"#FFB84D",
	"#A78BFA",
	"#4ADEDF",
	"#FB923C",
	"#F472B6",
]

export default function BirthdayCard({ student }: BirthdayCardProps) {
	// Generate 6 balloons with random configs
	const balloons: BalloonConfig[] = useMemo(
		() =>
			Array.from({ length: 6 }, (_, i) => ({
				id: i,
				size: 35 + Math.random() * 20, // 35-55px
				color:
					BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
				duration: 2000 + Math.random() * 1500, // 2-3.5 seconds
				delay: i * 600, // Stagger start times
				startX: Math.random() * 80 + 10, // Random position between 10-90%
				opacity: Math.random() > 0.5 ? 0.4 : 0.15, // 50% chance opaque vs semi-transparent
			})),
		[]
	)

	return (
		<SchoolCard style={styles.container}>
			<View style={styles.balloonsContainer}>
				{balloons.map((balloon) => (
					<AnimatedBalloon key={balloon.id} config={balloon} />
				))}
			</View>
			<View style={styles.contentContainer}>
				<Text style={styles.title}>🎉 ¡Feliz Cumpleaños! 🎉</Text>
				<Text style={styles.name}>{displayName(student)}</Text>
			</View>
		</SchoolCard>
	)
}

function AnimatedBalloon({ config }: { config: BalloonConfig }) {
	const startPosition = 100 // Always start below container
	const translateY = useSharedValue(startPosition)

	useEffect(() => {
		translateY.value = startPosition
		translateY.value = withDelay(
			config.delay,
			withRepeat(
				withTiming(-150, {
					duration: config.duration,
					easing: Easing.linear,
				}),
				-1,
				false
			)
		)
	}, [])

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}))

	return (
		<Animated.View
			style={[
				styles.balloon,
				{
					left: `${config.startX}%`,
					bottom: 0,
					opacity: config.opacity,
				},
				animatedStyle,
			]}
		>
			<Balloon size={config.size} color={config.color} />
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: "relative",
		overflow: "hidden",
		marginBottom: theme.spacing.lg,
	},
	balloonsContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
	},
	balloon: {
		position: "absolute",
	},
	contentContainer: {
		alignItems: "center",
		zIndex: 1,
	},
	title: {
		fontSize: theme.typography.size.lg,
		fontWeight: "700",
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs,
		textAlign: "center",
	},
	name: {
		fontSize: theme.typography.size.md,
		fontWeight: "600",
		color: theme.colors.text,
		textAlign: "center",
	},
})
