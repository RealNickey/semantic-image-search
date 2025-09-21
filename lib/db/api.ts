"use server";

import {
  cosineDistance,
  desc,
  getTableColumns,
  gt,
  or,
  sql,
} from "drizzle-orm";
import { db } from ".";
import { DBImage, images } from "./schema";
import { generateEmbedding } from "../ai/utils";
let kvClient: typeof import("@vercel/kv")["kv"] | undefined;
try {
  // Lazy import KV; allow running without KV configured
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  kvClient = require("@vercel/kv").kv;
} catch {
  // no-op; KV not available
}

// Select all image columns except the vector embedding to lighten payloads,
// but keep a dummy "embedding" field to satisfy typing when mapping to DBImage
const { embedding: _embedding, ...rest } = getTableColumns(images);
const imagesWithoutEmbedding = {
  ...rest,
  // Return an empty integer array for embedding to avoid transferring vector data
  embedding: sql<number[]>`ARRAY[]::integer[]`,
} as const;

export const findSimilarContent = async (description: string) => {
  try {
    const embedding = await generateEmbedding(description);
    const similarity = sql<number>`1 - (${cosineDistance(
      images.embedding,
      embedding
    )})`;
    const similar = await db
      .select({ image: imagesWithoutEmbedding, similarity })
      .from(images)
      .where(gt(similarity, 0.28))
      .orderBy((t) => desc(t.similarity))
      .limit(10);
    return similar;
  } catch (e) {
    console.error("Semantic search failed; falling back to direct query:", e);
    return [] as Array<{ image: DBImage; similarity: number }>;
  }
};

export const findImageByQuery = async (query: string) => {
  const result = await db
    .select({ image: imagesWithoutEmbedding, similarity: sql<number>`1` })
    .from(images)
    .where(
      or(
        sql`title ILIKE ${"%" + query + "%"}`,
        sql`description ILIKE ${"%" + query + "%"}`
      )
    );
  return result;
};

function uniqueItemsByObject(items: DBImage[]): DBImage[] {
  const seenObjects = new Set<string>();
  const uniqueItems: DBImage[] = [];

  for (const item of items) {
    if (!seenObjects.has(item.id)) {
      seenObjects.add(item.id);
      uniqueItems.push(item);
    }
  }

  return uniqueItems;
}

export const getImages = async (
  query?: string
): Promise<{ images: DBImage[]; error?: Error }> => {
  try {
    // When no query is provided, get the latest images.
    // We don't cache this as it's not a heavy query.
    if (!query || query.length < 3) {
      const allImages = await db
        .select(imagesWithoutEmbedding)
        .from(images)
        .orderBy(desc(images.id))
        .limit(16);
      return { images: allImages };
    }

    const formattedQuery = `q:${query.replaceAll(" ", "_")}`;
    try {
      if (kvClient) {
        const cached = await kvClient.get<DBImage[]>(formattedQuery);
        if (cached) {
          return { images: cached };
        }
      }
    } catch (e) {
      console.warn("KV get failed or not configured:", e);
    }

    const [directMatches, semanticMatches] = await Promise.all([
      findImageByQuery(query),
      findSimilarContent(query),
    ]);
    const allMatches = uniqueItemsByObject(
      [...directMatches, ...semanticMatches].map((image) => ({
        ...image.image,
        similarity: image.similarity,
      }))
    );

    try {
      if (kvClient) {
        // cache for 1 minute to keep results fresh after new inserts
        await kvClient.set(formattedQuery, allMatches, { ex: 60 });
      }
    } catch (e) {
      console.warn("KV set failed or not configured:", e);
    }
    return { images: allMatches };
  } catch (e) {
    if (e instanceof Error) return { error: e, images: [] };
    return {
      images: [],
      error: { message: "Error, please try again." } as Error,
    };
  }
};
