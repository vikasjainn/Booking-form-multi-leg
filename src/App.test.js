import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Multi-leg Travel Form heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Multi-leg Travel Form/i);
  expect(headingElement).toBeInTheDocument();
});
