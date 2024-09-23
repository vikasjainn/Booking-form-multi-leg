import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiLegForm from '../components/FormComponent';  // or the actual folder

describe('MultiLegForm Tests', () => {
  
  // Test for initial rendering
  test('renders form with initial inputs', () => {
    render(<MultiLegForm />);

    // Check that at least one leg is rendered
    expect(screen.getByText(/Leg 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Departure Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrival Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Departure Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Passengers/i)).toBeInTheDocument();
  });

  // Test for required field validations
  test('shows required validation messages', async () => {
    render(<MultiLegForm />);

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText(/Departure Location is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Arrival Location is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Departure Date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/At least one passenger is required/i)).toBeInTheDocument();
    });
  });

  // Test that departure and arrival locations can't be the same
  test('validates that departure and arrival cannot be the same', async () => {
    render(<MultiLegForm />);
    
    const departureSelect = screen.getByLabelText(/Departure Location/i);
    const arrivalSelect = screen.getByLabelText(/Arrival Location/i);
    
    fireEvent.change(departureSelect, { target: { value: 'New York' } });
    fireEvent.change(arrivalSelect, { target: { value: 'New York' } });
    
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText(/Departure and arrival locations cannot be the same/i)).toBeInTheDocument();
    });
  });

  // Test that dates must be in ascending order
  test('validates that dates are in ascending order', async () => {
    render(<MultiLegForm />);

    const departureDate1 = screen.getByLabelText(/Departure Date/i);
    const addLegButton = screen.getByText('Add Leg');

    // Add a second leg
    fireEvent.click(addLegButton);

    const departureDate2 = screen.getAllByLabelText(/Departure Date/i)[1];
    
    fireEvent.change(departureDate1, { target: { value: '2024-01-01' } });
    fireEvent.change(departureDate2, { target: { value: '2023-12-31' } }); // Invalid date order
    
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText(/Dates must be in ascending order/i)).toBeInTheDocument();
    });
  });

  // Test adding a leg
  test('can add a leg and remove it', async () => {
    render(<MultiLegForm />);

    const addLegButton = screen.getByText('Add Leg');
    fireEvent.click(addLegButton);

    expect(screen.getByText(/Leg 2/i)).toBeInTheDocument();

    const removeLegButton = screen.getByText('Remove Leg');
    fireEvent.click(removeLegButton);

    await waitFor(() => {
      expect(screen.queryByText(/Leg 2/i)).not.toBeInTheDocument();
    });
  });

  // Test submitting a valid form
  test('submits form with valid data', async () => {
    render(<MultiLegForm />);

    const departureSelect = screen.getByLabelText(/Departure Location/i);
    const arrivalSelect = screen.getByLabelText(/Arrival Location/i);
    const departureDate = screen.getByLabelText(/Departure Date/i);
    const passengersInput = screen.getByLabelText(/Number of Passengers/i);

    fireEvent.change(departureSelect, { target: { value: 'New York' } });
    fireEvent.change(arrivalSelect, { target: { value: 'London' } });
    fireEvent.change(departureDate, { target: { value: '2024-01-01' } });
    fireEvent.change(passengersInput, { target: { value: '3' } });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      // Check if modal with the correct data is displayed
      expect(screen.getByText(/Form Submitted Successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/New York to London/i)).toBeInTheDocument();
      expect(screen.getByText(/2024-01-01/i)).toBeInTheDocument();
      expect(screen.getByText(/3 passengers/i)).toBeInTheDocument();
    });
  });

  // Test that no more than 5 legs can be added
  test('does not allow more than 5 legs', async () => {
    render(<MultiLegForm />);

    const addLegButton = screen.getByText('Add Leg');

    // Add legs up to the maximum limit
    for (let i = 0; i < 5; i++) {
      fireEvent.click(addLegButton);
    }

    fireEvent.click(addLegButton); // This should not add a 6th leg

    expect(screen.getAllByText(/Leg/i).length).toBe(5); // No more than 5 legs
  });
});
