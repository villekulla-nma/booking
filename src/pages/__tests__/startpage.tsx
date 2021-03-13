import { render, screen } from '@testing-library/react';
import { StartPage } from '../startpage';

test('renders learn react link', () => {
  render(<StartPage />);
  const buttonElement = screen.getByText(/Monat/i);
  expect(buttonElement).toBeInTheDocument();
});
