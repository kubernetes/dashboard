// Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
import '@angular/localize/init';

import 'jest-preset-angular/setup-jest';
import './test.base.mocks';

// Async operations timeout
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
jest.setTimeout(15000);
