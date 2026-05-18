import { Injectable } from "@nestjs/common";
import { chromium } from "playwright";

@Injectable()
export class AmazonFranceParser {
  async parse(url: string) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const title = await page.locator('#title').textContent();
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