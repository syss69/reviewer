import { Injectable } from "@nestjs/common";
import { chromium } from "playwright";

@Injectable()
export class AmazonGlobalParser {
  async parse(url: string) {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      locale: 'en-US',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const titleContainer = page.locator('#titleSection') 
    const title = (await titleContainer.locator('#productTitle').textContent())?.trim();
    const priceContainer = page.locator('#corePriceDisplay_desktop_feature_div');
    const wholePrice = await priceContainer.locator('.a-price-whole').first().textContent();
    const fractionPrice = await priceContainer.locator('.a-price-fraction').first().textContent();
    const symbolPrice = await priceContainer.locator('.a-price-symbol').first().textContent();
    if(!wholePrice || !fractionPrice) throw new Error('Price not found');
    const price = `${symbolPrice?.trim() ?? ''}${wholePrice?.trim() ?? '0'}${fractionPrice?.trim() ?? '00'}`;
    const description = await page.locator('#feature-bullets').textContent();
    await browser.close();
    return {
      title,
      price,
      description,
    };
  }
}