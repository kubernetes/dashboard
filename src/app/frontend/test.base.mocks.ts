Object.defineProperty(document, 'doctype', {value: '<!DOCTYPE html>'});

/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

Object.defineProperties(window, {
  crypto: {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    value: {getRandomValues: () => [2, 4, 8, 16]},
  },
  URL: {value: {createObjectURL: () => {}}},
  getComputedStyle: {
    value: () => {
      return {
        display: 'none',
        appearance: ['-webkit-appearance'],
        getPropertyValue: () => {},
      };
    },
  },
  matchMedia: {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  },
  CSS: {value: null},
});
