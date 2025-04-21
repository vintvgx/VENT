import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { supabase } from '@/lib/supabase/supabase';
import { useMutation } from '@tanstack/react-query';
import ProfileScreen from '@/app/(onboard)/profile';
import {
  expectInputField,
  fillFormFields,
  expectButtonDisabled,
  submitForm,
  expectErrorMessage,
  expectSupabaseUpsert,
  mockMutation
} from '../utils/test-utils';

// Mock Supabase
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
  }),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile form with initial state', () => {
    render(<ProfileScreen />);
    
    // Check if form fields are present
    expectInputField('First Name');
    expectInputField('Last Name');
    expectInputField('Email');
    expectInputField('Phone Number');
    
    // Next button should be disabled initially
    expectButtonDisabled('Next', true);
  });

  it('enables Next button when all required fields are filled', async () => {
    render(<ProfileScreen />);
    
    // Fill in the form fields
    fillFormFields({
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john@example.com',
      'Phone Number': '+1234567890'
    });
    
    // Next button should be enabled
    expectButtonDisabled('Next', false);
  });

  it('handles successful profile update', async () => {
    // Mock successful mutation
    mockMutation({ success: true });

    render(<ProfileScreen />);
    
    // Submit the form
    submitForm({
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john@example.com',
      'Phone Number': '+1234567890'
    }, 'Next');
    
    // Verify Supabase was called with correct data
    await waitFor(() => {
      expectSupabaseUpsert('profiles', {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      });
    });
  });

  it('handles profile update error', async () => {
    // Mock error in mutation
    mockMutation({ error: new Error('Update failed') });

    render(<ProfileScreen />);
    
    // Submit the form
    submitForm({
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john@example.com',
      'Phone Number': '+1234567890'
    }, 'Next');
    
    // Verify error is displayed
    await waitFor(() => {
      expectErrorMessage('Failed to update profile');
    });
  });

  it('validates email format', async () => {
    render(<ProfileScreen />);
    
    // Fill in the form with invalid email
    fillFormFields({
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'invalid-email',
      'Phone Number': '+1234567890'
    });
    
    // Next button should still be disabled
    expectButtonDisabled('Next', true);
    
    // Error message should be displayed
    expectErrorMessage('Please enter a valid email');
  });

  it('validates phone number format', async () => {
    render(<ProfileScreen />);
    
    // Fill in the form with invalid phone
    fillFormFields({
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john@example.com',
      'Phone Number': '123'
    });
    
    // Next button should still be disabled
    expectButtonDisabled('Next', true);
    
    // Error message should be displayed
    expectErrorMessage('Please enter a valid phone number');
  });
}); 