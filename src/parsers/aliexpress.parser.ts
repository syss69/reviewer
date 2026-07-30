import { Injectable, NotFoundException } from '@nestjs/common';
import type { Page, Response } from 'playwright';
import { ProductDto } from '../common/dto/product.dto';
import { ProductParser } from '../common/interfaces/product-parser.interface';
import { PlaywrightBrowserService } from '../playwright/playwright-browser.service';

const ALIEXPRESS_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const NAV_TIMEOUT_MS = 30_000;
const PDP_API_TIMEOUT_MS = 30_000;

type AliExpressPdpResult = Record<string, unknown> & {
  PRODUCT_TITLE?: { text?: string };
  PRICE?: { targetSkuPriceInfo?: { salePriceString?: string } };
  DESC?: { nativeDescUrl?: string };
};

@Injectable()
export class AliExpressParser implements ProductParser {
  constructor(private readonly playwrightBrowser: PlaywrightBrowserService) {}

  async parse(url: string): Promise<ProductDto> {
    const browser = await this.playwrightBrowser.getBrowser();
    const context = await browser.newContext({
      locale: 'en-US',
      userAgent: ALIEXPRESS_DESKTOP_UA,
      viewport: { width: 1440, height: 900 },
    });

    try {
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);

      const pdpPromise = waitForPdpResult(page, PDP_API_TIMEOUT_MS);
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });

      let result: AliExpressPdpResult;
      try {
        result = await pdpPromise;
      } catch {
        await page.waitForTimeout(3000);
        const retryPromise = waitForPdpResult(page, PDP_API_TIMEOUT_MS);
        await page.reload({
          waitUntil: 'domcontentloaded',
          timeout: NAV_TIMEOUT_MS,
        });
        result = await retryPromise;
      }

      const title = result.PRODUCT_TITLE?.text?.trim() ?? '';
      const price =
        result.PRICE?.targetSkuPriceInfo?.salePriceString?.trim() ?? '';

      if (!title) {
        throw new NotFoundException(
          'AliExpress: product title not found in PDP API response',
        );
      }

      const overview = extractSpecifications(result);
      const descriptionFromUrl = await fetchNativeDescription(
        page,
        result.DESC?.nativeDescUrl,
      );
      // Промпты читают description — если длинного описания нет, отдаём характеристики
      const description = descriptionFromUrl || overview;

      return {
        title,
        price,
        overview,
        description,
      };
    } finally {
      await context.close();
    }
  }
}

function waitForPdpResult(
  page: Page,
  timeoutMs: number,
): Promise<AliExpressPdpResult> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('response', onResponse);
      reject(new NotFoundException('AliExpress: PDP API timeout'));
    }, timeoutMs);

    const onResponse = async (response: Response) => {
      if (!response.url().includes('mtop.aliexpress.pdp.pc.query')) return;

      try {
        const text = await response.text();
        if (text.includes('FAIL_SYS_TOKEN')) return;

        const jsonStr = text
          .trim()
          .replace(/^mtopjsonp\d+\(/, '')
          .replace(/\);?$/, '');
        const payload = JSON.parse(jsonStr) as {
          data?: { result?: AliExpressPdpResult };
        };
        const result = payload?.data?.result;

        if (!result?.PRODUCT_TITLE?.text) return;

        clearTimeout(timer);
        page.off('response', onResponse);
        resolve(result);
      } catch {
        // ждём следующий ответ
      }
    };

    page.on('response', onResponse);
  });
}

/** Характеристики из PDP (разные ключи на разных карточках). */
function extractSpecifications(result: Record<string, unknown>): string {
  const blocks = [
    result.PRODUCT_PROP_PC,
    result.PRODUCT_PROP,
    result.SPECIFICATION,
    result.PROPS,
    result.productProps,
    result.specifications,
  ];

  for (const block of blocks) {
    const text = formatPropsBlock(block);
    if (text) return text;
  }

  return '';
}

function formatPropsBlock(block: unknown): string {
  if (block == null) return '';
  if (Array.isArray(block)) return joinPropLines(block);

  if (typeof block !== 'object') return '';

  const o = block as Record<string, unknown>;
  const lists = [o.showedProps, o.props, o.propList, o.items, o.propertyList];

  for (const list of lists) {
    if (Array.isArray(list)) {
      const text = joinPropLines(list);
      if (text) return text;
    }
  }

  return '';
}

function joinPropLines(items: unknown[]): string {
  return items
    .map(formatPropLine)
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

function formatPropLine(item: unknown): string | null {
  if (item == null || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;

  const name = firstString(o.attrName, o.name, o.propName, o.key, o.title);
  const value = firstString(o.attrValue, o.value, o.propValue, o.text);

  if (name && value) return `${name}: ${value}`;
  return null;
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

async function fetchNativeDescription(
  page: Page,
  descUrl?: string,
): Promise<string> {
  if (!descUrl) return '';

  try {
    const data = await page.evaluate(async (u: string) => {
      const res = await fetch(u);
      const raw = await res.text();
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return raw;
      }
    }, descUrl);

    return formatNativeDescription(data);
  } catch {
    return '';
  }
}

function formatNativeDescription(data: unknown): string {
  if (data == null) return '';
  if (typeof data === 'string') return stripHtml(data);
  if (typeof data !== 'object') return '';

  const o = data as Record<string, unknown>;
  const parts: string[] = [];

  if (typeof o.pcDescContent === 'string')
    parts.push(stripHtml(o.pcDescContent));
  if (typeof o.description === 'string') parts.push(stripHtml(o.description));
  if (typeof o.content === 'string') parts.push(stripHtml(o.content));
  if (typeof o.mobileDetail === 'string') parts.push(stripHtml(o.mobileDetail));

  if (Array.isArray(o.moduleList)) {
    for (const mod of o.moduleList) {
      if (mod == null || typeof mod !== 'object') continue;
      const m = mod as Record<string, unknown>;
      const modData = m.data;
      if (modData == null || typeof modData !== 'object') continue;
      const d = modData as Record<string, unknown>;
      if (typeof d.content === 'string') parts.push(stripHtml(d.content));
      if (typeof d.text === 'string') parts.push(stripHtml(d.text));
    }
  }

  return [...new Set(parts.filter(Boolean))].join('\n\n').trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
