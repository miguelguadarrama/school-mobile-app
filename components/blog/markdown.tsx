import Markdown from "@ronradtke/react-native-markdown-display"
import { Linking, ScrollView } from "react-native"

export default function MdRenderer({ md }: { md: string }) {
	return (
		<ScrollView contentContainerStyle={{ padding: 16 }}>
			<Markdown
				style={{
					body: { fontSize: 16, lineHeight: 22 },
					heading1: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
					link: { textDecorationLine: "underline" },
				}}
				onLinkPress={(url) => {
					Linking.openURL(url)
					return false
				}}
			>
				{md}
			</Markdown>
		</ScrollView>
	)
}
