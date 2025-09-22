import { ReactNode, useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import { setupNotificationListeners } from "../services/notifications"
import { chat_message, chats } from "../types/chat"
import { attendanceStatus, student } from "../types/students"
import LoadingScreen from "./Loading"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
	const {
		data,
		isLoading,
		mutate: refreshAppData,
	} = useSWR<{
		students: student[]
		attendance: attendanceStatus[]
		roles: ("admin" | "guardian" | "staff")[]
	}>(loggedIn ? "/mobile/profile" : null)
	const {
		data: rawChats,
		isLoading: chatLoading,
		mutate: refreshChat,
	} = useSWR(
		loggedIn && selectedStudent ? `/mobile/chat/${selectedStudent.id}` : null,
		{
			refreshInterval: 15000,
			dedupingInterval: 10000,
			revalidateOnFocus: true,
		}
	)

	// State to hold optimistic messages
	const [optimisticMessages, setOptimisticMessages] = useState<{
		[key: string]: chat_message[]
	}>({})

	// Merge real data with optimistic messages
	const chats = rawChats
		? rawChats.map((chat: chats) => {
				const chatKey = `${chat.staff.id}-${chat.student_id}`
				const optimistic = optimisticMessages[chatKey] || []

				// Filter out optimistic messages that might have been confirmed by server
				const filteredOptimistic = optimistic
					.filter(
						(optMsg) =>
							!chat.messages.some(
								(realMsg) =>
									realMsg.content === optMsg.content &&
									realMsg.sender_alias === optMsg.sender_alias &&
									Math.abs(
										new Date(realMsg.created_at).getTime() -
											new Date(optMsg.created_at).getTime()
									) < 5000
							)
					)
					.map((msg) => ({ ...msg, isOptimistic: true }))

				return {
					...chat,
					messages: [...chat.messages, ...filteredOptimistic],
				}
		  })
		: rawChats

	const addOptimisticMessage = useCallback(
		(staffId: string, studentId: string, message: chat_message) => {
			const chatKey = `${staffId}-${studentId}`
			setOptimisticMessages((prev) => ({
				...prev,
				[chatKey]: [...(prev[chatKey] || []), message],
			}))
		},
		[]
	)

	const removeOptimisticMessage = useCallback(
		(staffId: string, studentId: string, messageId: string) => {
			const chatKey = `${staffId}-${studentId}`
			setOptimisticMessages((prev) => ({
				...prev,
				[chatKey]: (prev[chatKey] || []).filter((msg) => msg.id !== messageId),
			}))
		},
		[]
	)

	// Clean up optimistic messages when selected student changes
	useEffect(() => {
		setOptimisticMessages({})
	}, [selectedStudent?.id])

	// Set up notification listeners when app is authenticated
	useEffect(() => {
		if (loggedIn) {
			const cleanup = setupNotificationListeners()
			return cleanup
		}
	}, [loggedIn])

	if (loggedIn && isLoading) {
		return <LoadingScreen />
	}

	const handleSetDate = (date: Date) => {
		// prevent a date in the future
		if (date > new Date()) return
		setSelectedDate(date)
	}

	//console.log({ id: data?.students?.[0]?.id, attendance: data?.attendance })
	return (
		<AppContext.Provider
			value={{
				isDataLoading: isLoading,
				refreshAppData,
				roles: data?.roles || [],
				students: data?.students || [],
				selectedStudent,
				setSelectedStudent,
				attendance: data?.attendance || [],
				selectedDate,
				setSelectedDate: handleSetDate,
				chats,
				refreshChat,
				chatLoading,
				addOptimisticMessage,
				removeOptimisticMessage,
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export default AppContainer
