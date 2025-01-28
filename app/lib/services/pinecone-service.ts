import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { ProductData, ProductEmbedding } from "@/app/lib/types/product";

export class PineconeService {
  private pinecone: Pinecone;
  private index: ReturnType<Pinecone["index"]>;

  constructor() {
    this.pinecone = new Pinecone();
    this.index = this.pinecone.index<ProductData>("products");
  }

  private generatePineconeRecords(
    embeddingsData: ProductEmbedding[]
  ): PineconeRecord<ProductData>[] {
    return embeddingsData.map(({ product, embedding }) => ({
      id: `${product.name}-${product.price}-${product.imageUrl}`,
      values: embedding,
      metadata: product,
    }));
  }

  private createBatches(
    vectors: PineconeRecord<ProductData>[],
    batchSize = 100
  ): PineconeRecord<ProductData>[][] {
    const batches: PineconeRecord<ProductData>[][] = [];
    for (let i = 0; i < vectors.length; i += batchSize) {
      batches.push(vectors.slice(i, i + batchSize));
    }
    return batches;
  }

  async upsertProducts(embeddingsData: ProductEmbedding[]): Promise<void> {
    if (!embeddingsData?.length) {
      throw new Error("No embeddings data to upsert to Pinecone.");
    }

    const pineconeRecords = this.generatePineconeRecords(embeddingsData);
    const batches = this.createBatches(pineconeRecords);

    console.log(`Starting to upsert ${batches.length} batches to Pinecone.`);

    const results = await Promise.allSettled(
      batches.map(async (batch, i) => {
        console.log(`Upserting batch ${i + 1}/${batches.length}`);
        return this.index.upsert(batch);
      })
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`Batch ${index + 1} upserted successfully.`);
      } else {
        console.error(`Failed to upsert batch ${index + 1}:`, result.reason);
      }
    });
  }

  /**
   * Middleware to handle Pinecone upsertion.
   */
  async upsertProductsMiddleware(
    req: Request,
    res: Response & { locals: { embeddingsData: ProductEmbedding[] } },
    next: NextFunction
  ): Promise<void> {
    try {
      const { embeddingsData } = res.locals;

      if (!embeddingsData || embeddingsData.length === 0) {
        console.error("No embeddings data found for upsertion.");
        res
          .status(400)
          .json({ error: "No embeddings data to upsert to Pinecone." });
        return;
      }

      await this.upsertProducts(embeddingsData);

      console.log("Successfully upserted all products to Pinecone.");
      next();
    } catch (error) {
      console.error("Error upserting products to Pinecone:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export const pineconeService = new PineconeService();
