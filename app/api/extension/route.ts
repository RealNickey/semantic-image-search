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
    const source = formData.get("source") as string;
    const originalUrl = formData.get("originalUrl") as string;
    const pageUrl = formData.get("pageUrl") as string;
    const pageTitle = formData.get("pageTitle") as string;

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

    // Initialize AI provider lazily (runtime)
    const ai = getAIProviders();
    const embeddingModel = ai.embedding;

    // 1. Upload the file to blob storage
    const filename = `${nanoid()}-${file.name}`;
    const { url } = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    // 2. Generate enhanced metadata using GPT-4o with context
    const contextPrompt =
      source === "chrome-extension"
        ? `This image was saved from a webpage. Page title: "${pageTitle}", Page URL: "${pageUrl}", Original image URL: "${originalUrl}". Describe the image in detail, considering its web context.`
        : "Describe the image in detail.";

    const result = await generateObject({
      model: ai.chat,
      schema: z.object({
        image: z.object({
          title: z.string().describe("an artistic title for the image"),
          description: z
            .string()
            .describe("A detailed description of the image"),
          tags: z.array(z.string()).describe("relevant tags for the image"),
          category: z.string().describe("main category of the image"),
        }),
      }),
      maxTokens: 512,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: contextPrompt },
            {
              type: "image",
              image: url,
            },
          ],
        },
      ],
    });

    // 3. Generate embedding with enhanced content
    const embeddingText = [
      result.object.image.title,
      result.object.image.description,
      result.object.image.category,
      ...result.object.image.tags,
      pageTitle || "",
      originalUrl || "",
    ]
      .filter(Boolean)
      .join("\n");

    const { embedding } = await embed({
      model: embeddingModel,
      value: embeddingText,
    });

    // 4. Save to database with additional metadata
    await db.insert(images).values({
      id: nanoid(),
      title: result.object.image.title,
      description: result.object.image.description,
      path: url,
      embedding,
      // Store additional metadata as JSON in description if needed
      // or add new columns to schema
    });
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      image: {
        url,
        title: result.object.image.title,
        description: result.object.image.description,
        tags: result.object.image.tags,
        category: result.object.image.category,
      },
      metadata: {
        source,
        originalUrl,
        pageUrl,
        pageTitle,
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

// GET endpoint to retrieve recent images for the extension
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get recent images from database
    const recentImages = await db
      .select({
        id: images.id,
        title: images.title,
        description: images.description,
        path: images.path,
      })
      .from(images)
      .orderBy(images.id) // Assuming id is timestamp-based
      .limit(limit);

    return NextResponse.json({
      success: true,
      images: recentImages.map((img) => ({
        id: img.id,
        url: img.path,
        title: img.title,
        description: img.description,
      })),
    });
  } catch (error) {
    console.error("Error retrieving images:", error);
    return NextResponse.json(
      { error: "Error retrieving images" },
      { status: 500 }
    );
  }
}
