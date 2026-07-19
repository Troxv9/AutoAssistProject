export const AVATAR_BUCKET = "avatars"
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export type AvatarMimeType = (typeof AVATAR_MIME_TYPES)[number]

const MIME_TO_EXT: Record<AvatarMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export function avatarObjectPath(userId: string, mimeType: AvatarMimeType) {
  return `${userId}/avatar.${MIME_TO_EXT[mimeType]}`
}

export function isAvatarMimeType(value: string): value is AvatarMimeType {
  return (AVATAR_MIME_TYPES as readonly string[]).includes(value)
}

export function getAvatarUrl(user: { user_metadata?: Record<string, unknown> } | null) {
  const value = user?.user_metadata?.avatar_url
  return typeof value === "string" && value.length > 0 ? value : null
}
