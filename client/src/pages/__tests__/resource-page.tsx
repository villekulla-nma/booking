import { render, screen } from '@testing-library/react';
import { ResourcePage } from '../resource-page';

test('renders learn react link', () => {
  render(<ResourcePage />);
  const buttonElement = screen.getByText(/Monat/i);
  expect(buttonElement).toBeInTheDocument();
});
