import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { broadcastAlert } from '@/app/lib/eventEmitter';

export async function POST(req: Request) {
  const body = await req.json();
  const { url } = body;

  try {
    if (!url) {
      console.log('Error: No URL provided');
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    broadcastAlert({
      type: 'started',
      message: `Starting to scrape ${url}`,
      timestamp: Date.now(),
    });

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    broadcastAlert({
      type: 'pageLoaded',
      message: `Page loaded: ${url}`,
      timestamp: Date.now(),
    });

    for (let i = 0; i < 2; i++) {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve(true);
            }
          }, 100);
        });
      });

      broadcastAlert({
        type: 'scrolling',
        message: `Scrolling down iteration ${i + 1}`,
        timestamp: Date.now(),
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    broadcastAlert({
      type: 'scrollComplete',
      message: `Scrolling completed for ${url}`,
      timestamp: Date.now(),
    });

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForSelector('body', { timeout: 120000 });
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const screenshot = await page.screenshot({
      fullPage: true,
      encoding: 'base64',
    });

    if (!screenshot || typeof screenshot !== 'string') {
      throw new Error('Failed to capture screenshot');
    }

    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);

    const buffer = Buffer.from(screenshot, 'base64');
    fs.writeFileSync(filepath, buffer);

    await browser.close();

    broadcastAlert({
      type: 'completed',
      message: `Scraping completed for ${url}`,
      timestamp: Date.now(),
    });

    return NextResponse.json({ imageUrl: `/screenshots/${filename}` });
  } catch (error) {
    console.error('Error scraping website:', error);
    broadcastAlert({
      type: 'error',
      message: `Error scraping ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now(),
    });
    return NextResponse.json({ error: 'Error scraping website' }, { status: 500 });
  }
}
