import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  avatarObjectPath,
  isAvatarMimeType,
} from "@/lib/profile/avatar"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "აირჩიეთ სურათი" }, { status: 400 })
  }

  if (!isAvatarMimeType(file.type)) {
    return NextResponse.json({ error: "დაშვებულია მხოლოდ JPG, PNG ან WebP" }, { status: 400 })
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return NextResponse.json({ error: "სურათი უნდა იყოს 2MB-ზე ნაკლები" }, { status: 400 })
  }

  const path = avatarObjectPath(user.id, file.type)
  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, bytes, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  })

  if (uploadError) {
    return NextResponse.json({ error: "ატვირთვა ვერ მოხერხდა" }, { status: 500 })
  }

  const { data: publicUrl } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  const avatarUrl = `${publicUrl.publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  })

  if (updateError) {
    return NextResponse.json({ error: "პროფილის განახლება ვერ მოხერხდა" }, { status: 500 })
  }

  return NextResponse.json({ avatarUrl })
}

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 })
  }

  const { data: files, error: listError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(user.id)

  if (listError) {
    return NextResponse.json({ error: "წაშლა ვერ მოხერხდა" }, { status: 500 })
  }

  if (files?.length) {
    const paths = files.map((file) => `${user.id}/${file.name}`)
    const { error: removeError } = await supabase.storage.from(AVATAR_BUCKET).remove(paths)
    if (removeError) {
      return NextResponse.json({ error: "წაშლა ვერ მოხერხდა" }, { status: 500 })
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  })

  if (updateError) {
    return NextResponse.json({ error: "პროფილის განახლება ვერ მოხერხდა" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
