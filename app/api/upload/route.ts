import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { embed, generateObject } from "ai";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";
import dotenv from "dotenv";
import { getAIProviders } from "@/lib/ai/utils";
import { revalidatePath } from "next/cache";

dotenv.config();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // 1. Upload the file to blob storage
    const filename = `${nanoid()}-${file.name}`;
    const { url } = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    // Initialize AI provider lazily (runtime)
    const ai = getAIProviders();
    const embeddingModel = ai.embedding;

    // 2. Generate metadata using GPT-4o/OpenAI
    const result = await generateObject({
      model: ai.chat,
      schema: z.object({
        image: z.object({
          title: z.string().describe("an artistic title for the image"),
          description: z
            .string()
            .describe("A one sentence description of the image"),
        }),
      }),
      maxTokens: 512,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe the image in detail." },
            {
              type: "image",
              image: url,
            },
          ],
        },
      ],
    });

    // 3. Generate embedding
    const { embedding } = await embed({
      model: embeddingModel,
      value: result.object.image.title + "\n" + result.object.image.description,
    });
    // 4. Save to database
    await db.insert(images).values({
      id: nanoid(),
      title: result.object.image.title,
      description: result.object.image.description,
      path: url,
      embedding,
    });
    // Ensure RSC caches are invalidated so the new image shows up immediately
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      image: {
        url,
        title: result.object.image.title,
        description: result.object.image.description,
      },
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { error: "Error processing upload" },
      { status: 500 }
    );
  }
}
