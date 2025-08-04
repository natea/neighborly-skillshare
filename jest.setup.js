// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Setup any global test utilities or mocks here

// Mock for HTMLCanvasElement.getContext to use the 'canvas' package in JSDOM
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (type) {
    if (type === '2d') {
      // Ensure 'canvas' package is installed for this to work
      try {
        const { Canvas } = require('canvas');
        const canvas = new Canvas(this.width, this.height);
        return canvas.getContext('2d');
      } catch (e) {
        console.error("Failed to use 'canvas' package for 2D context. Ensure it's installed.", e);
        return null; // Or throw the original JSDOM 'not implemented' error
      }
    }
    // For other contexts, you might return null or a mock
    return null;
  };
}