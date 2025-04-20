import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup MSW server with our handlers
export const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close the server after all tests
afterAll(() => server.close()); 