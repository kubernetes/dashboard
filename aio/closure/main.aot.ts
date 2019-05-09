import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
// noinspection TypeScriptCheckImport
import { RootModuleNgFactory } from './index_module.ngfactory';

enableProdMode();

platformBrowser().bootstrapModuleFactory(RootModuleNgFactory);
