import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { chromium, type Browser } from 'playwright';

@Injectable()
export class PlaywrightBrowserService implements OnModuleDestroy {
  private browser: Browser | null = null;

  async getBrowser(): Promise<Browser> {
    if (!this.browser?.isConnected()) {
      if (this.browser) {
        await this.browser.close().catch(() => undefined);
      }
      this.browser = await chromium.launch();
    }
    return this.browser;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser?.isConnected()) {
      await this.browser.close();
    }
    this.browser = null;
  }
}
