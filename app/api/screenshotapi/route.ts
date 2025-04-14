import { NextResponse } from 'next/server';
// @ts-expect-error: no types
import screenshotmachine from 'screenshotmachine';
import { broadcastAlert } from "@/app/lib/eventEmitter";

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const customerKey = process.env.SCREENSHOTMACHINE_KEY || '';
  const secretPhrase = process.env.SCREENSHOTMACHINE_SECRET || '';

  const options = {
    url,
    dimension: '1024xfull',
    device: 'desktop',
    format: 'png',
    cacheLimit: '0',
    delay: '500', 
    zoom: '100',
  };

  const apiUrl = screenshotmachine.generateScreenshotApiUrl(customerKey, secretPhrase, options);

  try {
    const screenshotResponse = await fetch(apiUrl);
    const contentType = screenshotResponse.headers.get("content-type");

    if (!screenshotResponse.ok || !contentType?.startsWith("image/")) {
      throw new Error('ScreenshotMachine did not return a valid image');
    }

    const arrayBuffer = await screenshotResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    broadcastAlert({
      type: 'Website recorded',
      message: `Website recorded`,
      timestamp: Date.now(),
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="screenshot.png"',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}
