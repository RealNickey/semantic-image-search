import { createAzure } from "@ai-sdk/azure";
import { generateObject } from "ai";
import dotenv from "dotenv";
import { z } from "zod";
import { ImageMetadata, writeAllMetadataToFile } from "./utils";
import { list } from "@vercel/blob";

dotenv.config();

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME!,
  apiKey: process.env.AZURE_API_KEY!,
});

async function main() {
  const blobs = await list();
  const files = blobs.blobs.map((b) => b.url);

  console.log("files to process:\n", files);

  const images: ImageMetadata[] = [];

  for (const file of files) {
    console.clear();
    console.log(
      `Generating description for ${file} (${files.indexOf(file) + 1}/${
        files.length
      })`
    );
    const result = await generateObject({
      model: azure(process.env.AZURE_GPT4O_DEPLOYMENT_NAME!),
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
              image: file,
            },
          ],
        },
      ],
    });
    images.push({ path: file, metadata: result.object.image });
  }
  await writeAllMetadataToFile(images, "images-with-metadata.json");
  console.log("All images processed!");
}

main().catch(console.error);
