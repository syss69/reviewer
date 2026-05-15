import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';
import { ProductDto } from '../common/dto/product.dto';
import { ProductParser } from '../common/interfaces/product-parser.interface';

@Injectable()
export class AmazonFranceParser implements ProductParser {
  async parse(url: string): Promise<ProductDto> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const title = await page.locator('#title').first().textContent();
    const priceContainer = page.locator('#corePriceDisplay_desktop_feature_div');
    const wholePrice = await priceContainer.locator('.a-price-whole').first().textContent();
    const fractionPrice = await priceContainer.locator('.a-price-fraction').first().textContent();
    const symbolPrice = await priceContainer.locator('.a-price-symbol').first().textContent();
    if (!wholePrice || !fractionPrice) throw new Error('Price not found');
    const price = `${symbolPrice?.trim() ?? ''}${wholePrice?.trim() ?? '0'}${fractionPrice?.trim() ?? '00'}`;
    const description = await page.locator('#feature-bullets').first().textContent();
    await browser.close();
    return {
      title: title?.trim() ?? '',
      price,
      description: description?.trim() ?? '',
    };
  }
}
