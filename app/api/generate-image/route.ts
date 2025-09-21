import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
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
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    } // 1. Generate image using Azure DALL-E 3
    // Log the API endpoint for debugging
    const endpoint = `${process.env.AZURE_DALLE_ENDPOINT}/openai/deployments/dall-e-3/images/generations?api-version=2024-02-01`;
    console.log("Using API endpoint:", endpoint);

    const dalleResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "api-key": process.env.AZURE_DALLE_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      }),
    });
    if (!dalleResponse.ok) {
      let errorMessage;
      try {
        const errorData = await dalleResponse.json();
        console.error("DALL-E API Error:", JSON.stringify(errorData, null, 2));
        errorMessage = errorData.error?.message || JSON.stringify(errorData);
      } catch {
        const errorText = await dalleResponse.text();
        console.error("DALL-E API Error:", errorText);
        errorMessage = errorText;
      }
      return NextResponse.json(
        { error: `Failed to generate image: ${errorMessage}` },
        { status: dalleResponse.status }
      );
    }

    const dalleResult = await dalleResponse.json();
    console.log("DALL-E API Response:", JSON.stringify(dalleResult, null, 2));

    // Azure OpenAI DALL-E response format
    const imageUrl = dalleResult.data?.[0]?.url;

    if (!imageUrl) {
      console.error("No image URL found in response:", dalleResult);
      return NextResponse.json(
        { error: "No image URL found in the API response" },
        { status: 500 }
      );
    }

    // 2. Download the generated image and upload to our blob storage
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const filename = `generated-${nanoid()}.png`;

    const { url: uploadedUrl } = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/png",
    });
    // 3. Generate metadata for the generated image
    const ai = getAIProviders();
    const embeddingModel = ai.embedding;
    const metadataResult = await generateObject({
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
            { type: "text", text: "Describe this generated image in detail." },
            {
              type: "image",
              image: uploadedUrl,
            },
          ],
        },
      ],
    });

    // 4. Generate embedding
    const { embedding } = await embed({
      model: embeddingModel,
      value:
        metadataResult.object.image.title +
        "\n" +
        metadataResult.object.image.description,
    });

    // 5. Save to database
    await db.insert(images).values({
      id: nanoid(),
      title: metadataResult.object.image.title,
      description: metadataResult.object.image.description,
      path: uploadedUrl,
      embedding,
    });
    // Invalidate cache so refreshed RSC pulls in new row immediately
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      image: {
        url: uploadedUrl,
        title: metadataResult.object.image.title,
        description: metadataResult.object.image.description,
        prompt: prompt,
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Error generating image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
