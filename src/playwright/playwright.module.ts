import { Global, Module } from '@nestjs/common';
import { PlaywrightBrowserService } from './playwright-browser.service';

@Global()
@Module({
  providers: [PlaywrightBrowserService],
  exports: [PlaywrightBrowserService],
})
export class PlaywrightModule {}
