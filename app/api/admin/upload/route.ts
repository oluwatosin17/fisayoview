import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

export async function POST(request: Request) {
  // Verify session
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = (formData.get("folder") as string | null) ?? "misc";

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || "image/jpeg";
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

  try {
    const result = await new Promise<{
      public_id: string;
      secure_url: string;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder: `fisayoview/${folder}`,
          resource_type: "image",
        },
        (err, res) => {
          if (err || !res) return reject(err ?? new Error("Upload failed"));
          resolve({
            public_id: res.public_id,
            secure_url: res.secure_url,
            width: res.width,
            height: res.height,
            format: res.format,
          });
        }
      );
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
