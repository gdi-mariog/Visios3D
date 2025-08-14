import { AppModule } from './app.module';
import { getTranslationProviders } from './i18n-providers';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

getTranslationProviders().then(providers => {
    const options = { providers };
    platformBrowserDynamic().bootstrapModule(AppModule, options);
});
