// src/setupTests.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import { vi } from 'vitest';

vi.stubGlobal('IntersectionObserver', class IntersectionObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
});
