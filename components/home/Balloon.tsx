import React from "react"
import Svg, { Path } from "react-native-svg"

interface BalloonProps {
	size?: number
	color?: string
}

export default function Balloon({ size = 40, color = "#FF6B9D" }: BalloonProps) {
	const stringLength = size * 0.6
	const width = size * 0.7 // Make width narrower (70% of size)
	const height = size * 1.2 // Make height taller (120% of size)

	return (
		<Svg
			width={size}
			height={height + stringLength}
			viewBox={`0 0 ${size} ${height + stringLength}`}
		>
			{/* Balloon body - oval/elongated balloon shape */}
			<Path
				d={`
					M ${size / 2} ${height * 0.9}
					Q ${size / 2.3} ${height * 0.95} ${size / 2} ${height}
					Q ${size / 1.77} ${height * 0.95} ${size / 2} ${height * 0.9}
					C ${size * 0.75} ${height * 0.85} ${size * 0.85} ${height * 0.6} ${size * 0.85} ${height * 0.35}
					C ${size * 0.85} ${height * 0.15} ${size * 0.7} 0 ${size / 2} 0
					C ${size * 0.3} 0 ${size * 0.15} ${height * 0.15} ${size * 0.15} ${height * 0.35}
					C ${size * 0.15} ${height * 0.6} ${size * 0.25} ${height * 0.85} ${size / 2} ${height * 0.9}
				`}
				fill={color}
			/>
			{/* String */}
			<Path
				d={`M ${size / 2} ${height} Q ${size / 2.5} ${height + stringLength / 3} ${size / 2} ${height + stringLength / 1.5} Q ${size / 1.7} ${height + stringLength * 0.85} ${size / 2} ${height + stringLength}`}
				stroke={color}
				strokeWidth={1.2}
				fill="none"
				opacity={0.6}
			/>
		</Svg>
	)
}
