import { NextResponse } from "next/server";
import { scraperService } from "@/app/lib/services/scraper-service";
import { openAIService } from "@/app/lib/services/openai-service";
import { pineconeService } from "@/app/lib/services/pinecone-service";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Scrape products
    const products = await scraperService.scrapeProducts(url);

    // Generate embeddings
    const embeddings = await openAIService.embedProducts(products);

    // Upsert to Pinecone
    await pineconeService.upsertProducts(embeddings);

    return NextResponse.json({
      message: "Request processed successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error scraping website:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
