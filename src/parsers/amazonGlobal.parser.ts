import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDto } from '../common/dto/product.dto';
import { ProductParser } from '../common/interfaces/product-parser.interface';
import { PlaywrightBrowserService } from '../playwright/playwright-browser.service';

const AMAZON_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const NAV_TIMEOUT_MS = 30_000;
const CONTENT_TIMEOUT_MS = 30_000;
const OPTIONAL_BLOCK_TIMEOUT_MS = 10_000;

@Injectable()
export class AmazonGlobalParser implements ProductParser {
  constructor(private readonly playwrightBrowser: PlaywrightBrowserService) {}

  async parse(url: string): Promise<ProductDto> {
    const browser = await this.playwrightBrowser.getBrowser();
    const context = await browser.newContext({
      locale: 'en-US',
      userAgent: AMAZON_DESKTOP_UA,
      viewport: { width: 1440, height: 900 },
    });

    try {
      const page = await context.newPage();
      page.setDefaultTimeout(CONTENT_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);

      await page.goto(url, { waitUntil: 'load' });

      const fetchTitle = async (): Promise<string> => {
        const titleContainer = page.locator('#titleSection');
        await titleContainer.waitFor({ state: 'attached', timeout: CONTENT_TIMEOUT_MS });
        const titleLoc = titleContainer.locator('#productTitle');
        await titleLoc.waitFor({ state: 'attached', timeout: CONTENT_TIMEOUT_MS });
        return (await titleLoc.textContent())?.trim() ?? '';
      };

      const fetchPrice = async (): Promise<string> => {
        const priceContainer = page.locator('#corePriceDisplay_desktop_feature_div');
        await priceContainer.first().waitFor({ state: 'attached', timeout: CONTENT_TIMEOUT_MS });
        const [wholePrice, fractionPrice, symbolPrice] = await Promise.all([
          priceContainer.locator('.a-price-whole').first().textContent(),
          priceContainer.locator('.a-price-fraction').first().textContent(),
          priceContainer.locator('.a-price-symbol').first().textContent(),
        ]);
        if (!wholePrice || !fractionPrice) {
          throw new NotFoundException('Amazon: price not found');
        }
        return `${symbolPrice?.trim() ?? ''}${wholePrice?.trim() ?? '0'}${fractionPrice?.trim() ?? '00'}`;
      };


      const optionalText = async (selector: string): Promise<string> => {
        try {
          const el = page.locator(selector).first();
          await el.waitFor({ state: 'attached', timeout: OPTIONAL_BLOCK_TIMEOUT_MS });
          return (await el.textContent())?.trim() ?? '';
        } catch {
          return '';
        }
      };

      const [title, price, overviewFromPo, overviewFromFacts, description] = await Promise.all([
        fetchTitle(),
        fetchPrice(),
        optionalText('#poExpander'),
        optionalText('#productFactsDesktopExpander'),
        optionalText('#feature-bullets'),
      ]);

      if (!title) {
        throw new NotFoundException('Amazon: product title not found');
      }

      return {
        title,
        price,
        overview: overviewFromPo || overviewFromFacts,
        description,
      };
    } finally {
      await context.close();
    }
  }
}
