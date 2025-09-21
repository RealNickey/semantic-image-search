import { createAzure } from "@ai-sdk/azure";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Prefer OpenAI when OPENAI_API_KEY is available; otherwise use Azure with env-based config
export function getAIProviders() {
  const useOpenAI = !!process.env.OPENAI_API_KEY;
  if (useOpenAI) {
    return {
      provider: "openai" as const,
      chat: openai("gpt-4o"),
      embedding: openai.embedding("text-embedding-3-small"),
    };
  }

  const resourceName =
    process.env.AZURE_OPENAI_RESOURCE || process.env.AZURE_RESOURCE_NAME;
  const apiKey = process.env.AZURE_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2023-05-15";
  if (!resourceName || !apiKey) {
    throw new Error(
      "No AI provider configured. Set OPENAI_API_KEY for OpenAI or AZURE_API_KEY and AZURE_OPENAI_RESOURCE for Azure."
    );
  }
  const azure = createAzure({ resourceName, apiKey, apiVersion });
  return {
    provider: "azure" as const,
    chat: azure("gpt-4o"),
    embedding: azure.embedding("text-embedding-3-small"),
  };
}

export type ImageMetadata = {
  path: string;
  metadata: {
    title: string;
    description: string;
  };
};

export const embeddingModel = getAIProviders().embedding;

/**
 * Asynchronously gets all `.jpg` files in the specified directory.
 *
 * @param dir The directory to search within.
 * @returns A promise that resolves to an array of filenames.
 */
export async function getJpgFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(dir);
    const jpgFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".jpg"
    );
    return jpgFiles;
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error; // Re-throw the error for further handling if necessary
  }
}

/**
 * Writes all metadata to a single JSON file.
 *
 * @param metadataArray An array of metadata objects.
 * @param outputPath The path including filename to the output JSON file.
 */
export async function writeAllMetadataToFile(
  metadataArray: ImageMetadata[],
  outputPath: string
) {
  try {
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(metadataArray, null, 2)
    );
    console.log(`All metadata written to ${outputPath}`);
  } catch (error) {
    console.error("Error writing metadata to file:", error);
    throw error;
  }
}

export async function getMetadataFile(path: string): Promise<ImageMetadata[]> {
  try {
    const rawFile = await fs.promises.readFile(path, { encoding: "utf-8" });
    const file = JSON.parse(rawFile) as ImageMetadata[];
    return file;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error; // Re-throw the error for further handling if necessary
  }
}

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};
