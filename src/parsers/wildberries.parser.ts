import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Injectable } from '@nestjs/common';

const execFileAsync = promisify(execFile);

const WB_CARD_DETAIL_URL = 'https://card.wb.ru/cards/v4/detail';
const WB_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

@Injectable()
export class WildberriesParser {
  async parse(url: string): Promise<unknown> {
    const nm = extractNmFromUrl(url);
    const apiUrl = new URL(WB_CARD_DETAIL_URL);
    apiUrl.searchParams.set('appType', '0');
    apiUrl.searchParams.set('curr', 'rub');
    apiUrl.searchParams.set('dest', '-1257786');
    apiUrl.searchParams.set('spp', '30');
    apiUrl.searchParams.set('nm', nm);

    return fetchCardDetail(apiUrl.toString());
  }
}

/** card.wb.ru (WBAAS) отклоняет TLS-отпечаток Node fetch; curl проходит. */
async function fetchCardDetail(apiUrl: string): Promise<unknown> {
  try {
    const { stdout } = await execFileAsync(
      'curl',
      [
        '-sS',
        '-f',
        apiUrl,
        '-H',
        'Accept: application/json',
        '-H',
        `User-Agent: ${WB_DESKTOP_UA}`,
        '-H',
        'Referer: https://www.wildberries.ru/',
        '-H',
        'Origin: https://www.wildberries.ru',
      ],
      { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' },
    );

    return JSON.parse(stdout) as unknown;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      throw new Error('Wildberries: curl not found in PATH');
    }

    const stderr =
      err && typeof err === 'object' && 'stderr' in err
        ? String((err as { stderr?: string }).stderr).trim()
        : '';

    throw new Error(
      `Wildberries: card API request failed${stderr ? `: ${stderr}` : ''}`,
    );
  }
}

function extractNmFromUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Wildberries: invalid product URL');
  }

  const fromQuery = parsed.searchParams.get('nm');
  if (fromQuery) return fromQuery;

  const fromPath = parsed.pathname.match(/\/catalog\/(\d+)/);
  if (fromPath) return fromPath[1];

  throw new Error('Wildberries: could not extract product id (nm) from URL');
}
