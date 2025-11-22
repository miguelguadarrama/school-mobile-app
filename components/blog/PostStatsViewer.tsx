import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
	ActivityIndicator,
	BackHandler,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import useSWR from "swr"
import { theme } from "../../helpers/theme"
import { BlogPostViewStats } from "../../types/post"

interface PostStatsViewerProps {
	postId: string
	onBack: () => void
}

type StatsTab = "views" | "clicks"

interface PostStatsResponse {
	views: BlogPostViewStats[]
	clicks: BlogPostViewStats[]
}

export const PostStatsViewer: React.FC<PostStatsViewerProps> = ({
	postId,
	onBack,
}) => {
	const insets = useSafeAreaInsets()
	const [selectedTab, setSelectedTab] = useState<StatsTab>("views")

	const { data, isLoading } = useSWR<PostStatsResponse>(
		`/mobile/posts/${postId}/stats`
	)

	useEffect(() => {
		const handleBackPress = () => {
			onBack()
			return true
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => backHandler.remove()
	}, [onBack])

	const currentData = selectedTab === "views" ? data?.views : data?.clicks
	const totalCount =
		currentData?.reduce((sum, item) => sum + item.count, 0) || 0

	const renderStatItem = ({ item }: { item: BlogPostViewStats }) => (
		<View style={styles.statItem}>
			<View style={styles.statItemHeader}>
				<View style={styles.avatarPlaceholder}>
					<Ionicons name="person" size={20} color={theme.colors.muted} />
				</View>
				<View style={styles.statItemInfo}>
					<Text style={styles.statItemName}>
						{item.user.full_name.toLowerCase()}
					</Text>
					<Text style={styles.statItemEmail}>{item.user.email}</Text>
				</View>
			</View>
			<View style={styles.countBadge}>
				<Text style={styles.countBadgeText}>{item.count}</Text>
			</View>
		</View>
	)

	return (
		<View style={styles.container}>
			{/* Header */}
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={onBack}>
						<Ionicons
							name="chevron-back"
							size={24}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
					<View style={styles.headerInfo}>
						<Text style={styles.headerTitle}>Estadísticas</Text>
						<Text style={styles.headerSubtitle}>
							{selectedTab === "views" ? "Vistas" : "Descargas"}
						</Text>
					</View>
				</View>
			</SafeAreaView>

			{/* Tab Selector */}
			<View style={styles.tabContainer}>
				<TouchableOpacity
					style={[styles.tab, selectedTab === "views" && styles.tabActive]}
					onPress={() => setSelectedTab("views")}
					activeOpacity={0.7}
				>
					<Ionicons
						name="eye-outline"
						size={20}
						color={
							selectedTab === "views"
								? theme.colors.primary
								: theme.colors.muted
						}
					/>
					<Text
						style={[
							styles.tabText,
							selectedTab === "views" && styles.tabTextActive,
						]}
					>
						Vistas ({data?.views?.length || 0})
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.tab, selectedTab === "clicks" && styles.tabActive]}
					onPress={() => setSelectedTab("clicks")}
					activeOpacity={0.7}
				>
					<Ionicons
						name="download-outline"
						size={20}
						color={
							selectedTab === "clicks"
								? theme.colors.primary
								: theme.colors.muted
						}
					/>
					<Text
						style={[
							styles.tabText,
							selectedTab === "clicks" && styles.tabTextActive,
						]}
					>
						Descargas ({data?.clicks?.length || 0})
					</Text>
				</TouchableOpacity>
			</View>

			{/* Content */}
			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.loadingText}>Cargando estadísticas...</Text>
				</View>
			) : currentData && currentData.length > 0 ? (
				<>
					{/* Stats List */}
					<FlatList
						data={currentData}
						renderItem={renderStatItem}
						keyExtractor={(item) => item.user.id}
						contentContainerStyle={[
							styles.listContainer,
							{ paddingBottom: insets.bottom + theme.spacing.lg },
						]}
						showsVerticalScrollIndicator={false}
					/>
				</>
			) : (
				<View style={styles.emptyContainer}>
					<Ionicons
						name={
							selectedTab === "views" ? "eye-off-outline" : "download-outline"
						}
						size={64}
						color={theme.colors.muted}
					/>
					<Text style={styles.emptyText}>
						{selectedTab === "views"
							? "Aún no hay vistas registradas"
							: "Aún no hay descargas registradas"}
					</Text>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 1000,
	},
	headerContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	backButton: {
		marginRight: theme.spacing.md,
		padding: theme.spacing.xs,
	},
	headerInfo: {
		flex: 1,
		paddingRight: theme.spacing.md,
	},
	headerTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		color: theme.colors.text,
		fontWeight: "600",
	},
	headerSubtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginTop: 2,
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: theme.colors.surface,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	tab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.radius.md,
		gap: theme.spacing.xs,
	},
	tabActive: {
		backgroundColor: theme.colors.background,
	},
	tabText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	tabTextActive: {
		fontFamily: theme.typography.family.bold,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	summaryContainer: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	summaryText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
	},
	summaryCount: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.primary,
		fontWeight: "600",
	},
	listContainer: {
		padding: theme.spacing.md,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.md,
		borderRadius: theme.radius.md,
		marginBottom: theme.spacing.sm,
		...theme.shadow.card,
	},
	statItemHeader: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	avatarPlaceholder: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.background,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.sm,
	},
	statItemInfo: {
		flex: 1,
	},
	statItemName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		marginBottom: 2,
		textTransform: "capitalize",
	},
	statItemEmail: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	countBadge: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs / 2,
		borderRadius: theme.radius.sm,
		minWidth: 32,
		alignItems: "center",
	},
	countBadgeText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.white,
		fontWeight: "600",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.xl,
	},
	loadingText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		marginTop: theme.spacing.md,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: theme.spacing.xl,
	},
	emptyText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		marginTop: theme.spacing.md,
		textAlign: "center",
	},
})
