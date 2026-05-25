import { Injectable } from '@nestjs/common';
import { ProductDto } from '../common/dto/product.dto';
import { ProductParser } from '../common/interfaces/product-parser.interface';
import { PlaywrightBrowserService } from '../playwright/playwright-browser.service';

const AMAZON_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';


@Injectable()
export class AmazonFranceParser implements ProductParser {
  constructor(private readonly playwrightBrowser: PlaywrightBrowserService) {}

  async parse(url: string): Promise<ProductDto> {
    const browser = await this.playwrightBrowser.getBrowser();
    const context = await browser.newContext({
      locale: 'fr-FR',
      userAgent: AMAZON_DESKTOP_UA,
      viewport: { width: 1440, height: 900 },
    });

    try {
      const page = await context.newPage();
      await page.goto(url);
      const title = await page.locator('#title').first().textContent();
      const priceContainer = page.locator('#corePriceDisplay_desktop_feature_div');
      await priceContainer.first().waitFor({ state: 'attached'});
      const wholePrice = await priceContainer.locator('.a-price-whole').first().textContent();
      const fractionPrice = await priceContainer.locator('.a-price-fraction').first().textContent();
      const symbolPrice = await priceContainer.locator('.a-price-symbol').first().textContent();
      if (!wholePrice || !fractionPrice) throw new Error('Price not found');
      const price = `${symbolPrice?.trim() ?? ''}${wholePrice?.trim() ?? '0'}${fractionPrice?.trim() ?? '00'}`;
      const overview = await page.locator('#poExpander').first().textContent();
      const description = await page.locator('#feature-bullets').first().textContent();
      return {
        title: title?.trim() ?? '',
        price,
        overview: overview?.trim() ?? '',
        description: description?.trim() ?? '',
      };
    } finally {
      await context.close();
    }
  }
}
