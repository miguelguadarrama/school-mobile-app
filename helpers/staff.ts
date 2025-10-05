
export const getStaffPhotoUrl = (id: string) => {
  return `${process.env.EXPO_PUBLIC_STORAGE_URL}/app/users/${id}.jpg`
}