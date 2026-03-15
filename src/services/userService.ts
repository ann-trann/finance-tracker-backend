import prisma from "../prisma/client"
import bcrypt from "bcrypt"

export const updateUserName = async (userId: string, name: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, email: true, name: true, createdAt: true }
  })
  return user
}

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) throw new Error("Current password is incorrect")

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

  return { message: "Password updated successfully" }
}