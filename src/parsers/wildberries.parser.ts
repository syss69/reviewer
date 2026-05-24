import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDto } from '../common/dto/product.dto';
import { ProductParser } from '../common/interfaces/product-parser.interface';

const execFileAsync = promisify(execFile);

const WB_CARD_DETAIL_URL = 'https://card.wb.ru/cards/v4/detail';
const WB_DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

type WbDetailProduct = {
  name?: string;
  brand?: string;
  sizes?: Array<{
    price?: { basic?: number; product?: number };
  }>;
};

type WbDetailResponse = {
  products?: WbDetailProduct[];
  data?: { products?: WbDetailProduct[] };
};

type WbCardOption = { name?: string; value?: string };
type WbCardGroupedOption = {
  group_name?: string;
  options?: WbCardOption[];
};

type WbCardJson = {
  description?: string;
  options?: WbCardOption[];
  grouped_options?: WbCardGroupedOption[];
};

@Injectable()
export class WildberriesParser implements ProductParser {
  async parse(url: string): Promise<ProductDto> {
    const nmId = extractNmId(url);

    const detailUrl = new URL(WB_CARD_DETAIL_URL);
    detailUrl.searchParams.set('appType', '1');
    detailUrl.searchParams.set('curr', 'rub');
    detailUrl.searchParams.set('dest', '-1257786');
    detailUrl.searchParams.set('nm', nmId);

    const detail = await fetchJson<WbDetailResponse>(detailUrl.toString());
    if (!detail) {
      throw new NotFoundException('Wildberries: product not found');
    }

    const product = detail.products?.[0] ?? detail.data?.products?.[0];
    if (!product?.name) {
      throw new NotFoundException('Wildberries: product not found');
    }

    const card = await fetchBasketCard(nmId);

    const name = product.name.trim();
    const brand = product.brand?.trim() ?? '';
    const title = brand ? `${name}, ${brand}` : name;

    const priceRub = (product.sizes?.[0]?.price?.product ?? 0) / 100;
    const price = priceRub > 0 ? `${priceRub} ₽` : '';

    return {
      title,
      price,
      description: card.description?.trim() ?? '',
      overview: formatCharacteristics(card),
    };
  }
}

const MAX_BASKET_HOST = 40;

async function fetchBasketCard(nmId: string): Promise<WbCardJson> {
  const nm = Number(nmId);
  const vol = Math.floor(nm / 100_000);
  const part = Math.floor(nm / 1_000);
  const guessed = parseInt(getBasketNumber(vol), 10);

  const candidates: number[] = [];
  for (let b = guessed; b >= 1; b -= 1) candidates.push(b);
  for (let b = guessed + 1; b <= MAX_BASKET_HOST; b += 1) candidates.push(b);

  const tried = new Set<number>();
  for (const basket of candidates) {
    if (tried.has(basket)) continue;
    tried.add(basket);

    const card = await fetchJson<WbCardJson>(
      `https://basket-${String(basket).padStart(2, '0')}.wbbasket.ru/vol${vol}/part${part}/${nmId}/info/ru/card.json`,
      { notFoundOk: true },
    );
    if (card) return card;
  }

  throw new NotFoundException('Wildberries: card.json not found on basket hosts');
}

function getBasketNumber(vol: number): string {
  let basket = 1;
  let threshold = 143;

  while (vol > threshold && basket < MAX_BASKET_HOST) {
    basket += 1;
    threshold = 143 + (basket - 1) * 144;
  }

  return String(basket).padStart(2, '0');
}

function formatCharacteristics(card: WbCardJson): string {
  const lines: string[] = [];

  for (const group of card.grouped_options ?? []) {
    if (group.group_name) {
      lines.push(group.group_name);
    }
    for (const option of group.options ?? []) {
      const line = formatOptionLine(option);
      if (line) lines.push(line);
    }
  }

  if (!lines.length) {
    for (const option of card.options ?? []) {
      const line = formatOptionLine(option);
      if (line) lines.push(line);
    }
  }

  return lines.join('\n');
}

function formatOptionLine(option: WbCardOption): string | null {
  const name = option.name?.trim();
  const value = option.value?.trim();
  if (name && value) return `${name}: ${value}`;
  return null;
}

function extractNmId(input: string): string {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new NotFoundException('Wildberries: invalid product URL');
  }

  const fromQuery = parsed.searchParams.get('nm');
  if (fromQuery) return fromQuery;

  const fromPath = parsed.pathname.match(/\/catalog\/(\d+)/);
  if (fromPath) return fromPath[1];

  throw new NotFoundException('Wildberries: could not extract product id (nm) from URL');
}

type FetchJsonOptions = { notFoundOk?: boolean };

/** card.wb.ru / wbbasket отклоняют TLS-отпечаток Node fetch; curl проходит. */
async function fetchJson<T>(
  url: string,
  options?: FetchJsonOptions,
): Promise<T | null> {
  try {
    const { stdout } = await execFileAsync(
      'curl',
      [
        '-sS',
        '-w',
        '\n%{http_code}',
        url,
        '-H',
        'Accept: */*',
        '-H',
        `User-Agent: ${WB_DESKTOP_UA}`,
        '-H',
        'Referer: https://www.wildberries.ru/',
        '-H',
        'Origin: https://www.wildberries.ru',
      ],
      { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' },
    );

    const statusMatch = stdout.match(/\n(\d{3})$/);
    const status = statusMatch ? Number(statusMatch[1]) : 0;
    const body = stdout.replace(/\n\d{3}$/, '');

    if (status === 404 && options?.notFoundOk) return null;
    if (status < 200 || status >= 300) {
      throw new Error(`HTTP ${status}`);
    }

    return JSON.parse(body) as T;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      throw new NotFoundException('Wildberries: curl not found in PATH');
    }

    const stderr =
      err && typeof err === 'object' && 'stderr' in err
        ? String((err as { stderr?: string }).stderr).trim()
        : '';

    throw new Error(
      `Wildberries: request failed (${url})${stderr ? `: ${stderr}` : ''}`,
    );
  }
}
