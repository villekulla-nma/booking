// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import fetch from 'cross-fetch';

// - provide a `fetch` that can be hi-jacked by `msw`
// - make URL absolute, which is required on the server side
globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string') {
    input = `http://localhost${input}`;
  }
  return fetch(input, init);
};
