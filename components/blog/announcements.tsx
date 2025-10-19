import Markdown from "@ronradtke/react-native-markdown-display"
import React, { useState } from "react"
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { theme } from "../../helpers/theme"
import SchoolCard from "../SchoolCard"

export interface AnnouncementPost {
	id: string
	academic_year_id: string
	classroom_id: string | null
	title: string
	content: string
	author_id: string
	created_at: string
	published_at: string
	users: {
		email: string
		full_name: string
	}
	post_media: Array<{
		id: string
		url: string
		type: string
		thumbnail_url?: string
	}>
}

interface AnnouncementListProps {
	announcements: AnnouncementPost[]
	onRefresh?: () => void
	isRefreshing?: boolean
}

const AnnouncementCard: React.FC<{ announcement: AnnouncementPost }> = ({
	announcement,
}) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const CHARACTER_LIMIT = 150

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString("es-VE", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}

	const shouldTruncate = announcement.content.length > CHARACTER_LIMIT
	const displayContent =
		isExpanded || !shouldTruncate
			? announcement.content
			: announcement.content.substring(0, CHARACTER_LIMIT) + "..."

	return (
		<SchoolCard style={styles.card}>
			{/* Header with title and date */}
			<View style={styles.header}>
				<Text style={styles.title}>{announcement.title}</Text>
				<Text style={styles.date}>{formatDate(announcement.published_at)}</Text>
			</View>

			{/* Author information */}
			{/* <View style={styles.authorSection}>
				<Text style={styles.author}>Administración</Text>
			</View> */}

			{/* Content with markdown */}
			<View style={styles.contentContainer}>
				<Markdown
					style={{
						body: {
							fontSize: theme.typography.size.md,
							lineHeight: 22,
							color: theme.colors.text,
							fontFamily: theme.typography.family.regular,
						},
						heading1: {
							fontSize: theme.typography.size.xl,
							fontWeight: "600",
							marginBottom: 8,
							color: theme.colors.text,
							fontFamily: theme.typography.family.bold,
						},
						heading2: {
							fontSize: theme.typography.size.lg,
							fontWeight: "600",
							marginBottom: 6,
							color: theme.colors.text,
							fontFamily: theme.typography.family.bold,
						},
						paragraph: {
							marginBottom: theme.spacing.sm,
							color: theme.colors.text,
						},
						link: {
							textDecorationLine: "underline",
							color: theme.colors.primary,
						},
					}}
				>
					{displayContent}
				</Markdown>

				{/* Show expand/collapse button if content is truncated */}
				{shouldTruncate && (
					<TouchableOpacity
						style={styles.expandButton}
						onPress={() => setIsExpanded(!isExpanded)}
						activeOpacity={0.7}
					>
						<Text style={styles.expandButtonText}>
							{isExpanded ? "Leer menos" : "Leer más"}
						</Text>
					</TouchableOpacity>
				)}
			</View>
		</SchoolCard>
	)
}

const EmptyState: React.FC = () => (
	<View style={styles.emptyStateContainer}>
		<Text style={styles.emptyStateTitle}>No hay anuncios</Text>
		<Text style={styles.emptyStateText}>
			Aún no hay anuncios publicados. Vuelve más tarde para ver las novedades.
		</Text>
	</View>
)

export default function AnnouncementList({
	announcements,
	onRefresh = () => {},
	isRefreshing = false,
}: AnnouncementListProps) {
	const renderAnnouncement = ({ item }: { item: AnnouncementPost }) => (
		<AnnouncementCard announcement={item} />
	)

	return (
		<FlatList
			data={announcements}
			renderItem={renderAnnouncement}
			keyExtractor={(item) => item.id}
			contentContainerStyle={[
				styles.listContainer,
				announcements.length === 0 && styles.emptyListContainer,
			]}
			ListEmptyComponent={<EmptyState />}
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={onRefresh}
					colors={[theme.colors.primary]}
					tintColor={theme.colors.primary}
					title="Actualizar anuncios"
					titleColor={theme.colors.primary}
				/>
			}
			showsVerticalScrollIndicator={false}
		/>
	)
}

const styles = StyleSheet.create({
	listContainer: {
		padding: theme.spacing.md,
	},
	emptyListContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	card: {
		marginBottom: theme.spacing.lg,
	},
	header: {
		marginBottom: theme.spacing.md,
	},
	title: {
		fontSize: theme.typography.size.xl,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs,
		lineHeight: 28,
	},
	date: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
	},
	authorSection: {
		marginBottom: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	author: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		fontWeight: "500",
	},
	contentContainer: {
		// No padding needed as Markdown component handles its own spacing
	},
	expandButton: {
		alignSelf: "flex-start",
		marginTop: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		paddingHorizontal: theme.spacing.sm,
	},
	expandButtonText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	emptyStateContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.xl * 2,
		paddingHorizontal: theme.spacing.lg,
	},
	emptyStateIcon: {
		fontSize: 64,
		marginBottom: theme.spacing.lg,
	},
	emptyStateTitle: {
		fontSize: theme.typography.size.xl,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
		textAlign: "center",
	},
	emptyStateText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		textAlign: "center",
		lineHeight: 22,
		maxWidth: 280,
	},
})
