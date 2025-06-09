import React, { useContext } from "react"
import { StyleSheet, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import useSWR from "swr"
import AppContext from "../../contexts/AppContext"
import LoadingScreen from "../../components/Loading"
import BlogPostList from "../../components/blog"
import { SafeAreaView } from "react-native-safe-area-context"
import { BlogPost } from "../../types/post"
import { SocialStackParamList } from "../../types/navigation"

type SocialScreenNavigationProp = NativeStackNavigationProp<
	SocialStackParamList,
	"Social"
>

export default function SocialScreen() {
	const { students } = useContext(AppContext)!
	const navigation = useNavigation<SocialScreenNavigationProp>()

	const student = students?.[0]
	const classroom = student?.academic_year_classroom_students?.[0]?.classrooms
	const key = classroom ? `/mobile/posts/classroom/${classroom.id}` : null
	const { data, isLoading, mutate } = useSWR(key)

	//console.log(JSON.stringify(data, null, 2))

	// Handle refresh action
	const handleRefresh = async () => {
		if (key) {
			// Trigger a revalidation of the data
			await mutate()
		}
	}

	// Handle blog post card press
	const handleCardPress = (post: BlogPost) => {
		// Only navigate to PhotoGrid if the post has media
		if (post.post_media && post.post_media.length > 0) {
			navigation.navigate("PhotoGrid", {
				photos: post.post_media,
				title: post.title,
			})
		}
		// If no media, you could add other actions here like showing post details
	}

	if (isLoading || !classroom) {
		return <LoadingScreen />
	}

	return (
		<>
			<SafeAreaView edges={["top"]}>
				<Text style={styles.heading}>Social</Text>
			</SafeAreaView>
			<BlogPostList
				posts={data}
				onRefresh={handleRefresh}
				isRefreshing={isLoading}
				onCardPress={handleCardPress}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		marginTop: 16,
		paddingHorizontal: 16,
	},
})
