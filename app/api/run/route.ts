import { NextResponse } from "next/server";
import sharp from 'sharp';
import { openAIService } from "@/app/lib/services/openai-service";
import { uploadToImgbb } from "@/app/lib/services/imgbb-service";
import { broadcastAlert } from "@/app/lib/eventEmitter";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const screenshotFile = formData.get("screenshot") as File;
    const businessName = formData.get("businessName") as string;

    if (!screenshotFile || !businessName) {
      throw new Error("Missing screenshot or business name.");
    }

    const buffer = Buffer.from(await screenshotFile.arrayBuffer());

    broadcastAlert({
      type: 'ImgBB',
      message: `Uploading screenshot to Imgbb`,
      timestamp: Date.now(),
    });

  const compressedBuffer = await sharp(buffer)
    .resize({ width: 1024 }) // Resize to reduce resolution
    .png({ quality: 80 })    // Lower PNG quality for faster load
    .toBuffer();

    broadcastAlert({
      type: 'ImageCompression',
      message: `Compressing Image`,
      timestamp: Date.now(),
    });

    const imgbbUrl = await uploadToImgbb(compressedBuffer);

    broadcastAlert({
      type: 'ImgBB',
      message: `Screenshot uploaded to the web`,
      timestamp: Date.now(),
    });

    console.log("✅ Image uploaded to Imgbb:", imgbbUrl);

    broadcastAlert({
      type: 'OpenAI',
      message: `Sending screenshot to OpenAI`,
      timestamp: Date.now(),
    });

    const openAIResponse = await openAIService.analyzeScreenshot(imgbbUrl, businessName);

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(openAIResponse.message as string);
    } catch (parseError) {
      console.error("❌ Error parsing OpenAI message:", parseError);
      throw new Error("Failed to parse OpenAI response message.");
    }

    console.log("✅ Parsed OpenAI Message:", parsedMessage);

    const screenshotAnalysis = {
      score: parsedMessage.score ?? 0,
      metadata: {
        summary: parsedMessage.metadata?.summary ?? "No summary available.",
        restrictedItems: parsedMessage.metadata?.restrictedItems ?? { score: 0, message: "No data available." },
        productPages: parsedMessage.metadata?.productPages ?? { score: 0, message: "No data available." },
        ownership: parsedMessage.metadata?.ownership ?? { score: 0, message: "No data available." },
        overallSafety: parsedMessage.metadata?.overallSafety ?? { score: 0, message: "No data available." },
      },
    };

    return NextResponse.json({
      message: "Analysis completed",
      screenshotAnalysis,
      imgbbUrl,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? `Error: ${error.message}` : "Unknown error",
      },
      { status: 500 }
    );
  }
}



