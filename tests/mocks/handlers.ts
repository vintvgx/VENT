import { http, HttpResponse } from 'msw';

// Define your API endpoint (this is a placeholder - replace with your actual Supabase endpoint)
const baseUrl = 'https://fkpjukpmuvdmfxshiarm.supabase.co';

export const handlers = [
  // Mock OTP sign-in endpoint
  http.post(`${baseUrl}/auth/v1/otp`, async ({ request }) => {
    const { phone } = await request.json() as { phone: string };
    
    // Simulate successful OTP sending for valid numbers
    if (phone && phone.length > 8) {
      return HttpResponse.json({
        success: true,
        message: 'OTP sent successfully'
      }, { status: 200 });
    }
    
    // Simulate error for invalid numbers
    return HttpResponse.json({
      error: 'Invalid phone number format'
    }, { status: 400 });
  }),
  
  // Mock OTP verification endpoint
  http.post(`${baseUrl}/auth/v1/verify`, async ({ request }) => {
    const { phone, token, type } = await request.json() as { 
      phone: string; 
      token: string;
      type: string;
    };
    
    // Simulate successful verification for specific test cases
    if (phone === '+15551234567' && token === '123456' && type === 'sms') {
      return HttpResponse.json({
        user: {
          id: 'test-user-id',
          phone: phone,
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }
      }, { status: 200 });
    }
    
    // Simulate error for invalid verification
    return HttpResponse.json({
      error: 'Invalid OTP'
    }, { status: 400 });
  }),

  // Mock Google Sign-In endpoint
  http.post(`${baseUrl}/auth/v1/token`, async ({ request }) => {
    const { provider, id_token } = await request.json() as { 
      provider: string;
      id_token: string;
    };

    if (provider === 'google' && id_token) {
      return HttpResponse.json({
        user: {
          id: 'google-test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'google-test-access-token',
          refresh_token: 'google-test-refresh-token',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }
      }, { status: 200 });
    }

    return HttpResponse.json({
      error: 'Invalid Google token'
    }, { status: 400 });
  }),

  // Mock Apple Sign-In endpoint
  http.post(`${baseUrl}/auth/v1/token`, async ({ request }) => {
    const { provider, id_token } = await request.json() as { 
      provider: string;
      id_token: string;
    };

    if (provider === 'apple' && id_token) {
      return HttpResponse.json({
        user: {
          id: 'apple-test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'apple-test-access-token',
          refresh_token: 'apple-test-refresh-token',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }
      }, { status: 200 });
    }

    return HttpResponse.json({
      error: 'Invalid Apple token'
    }, { status: 400 });
  }),

  // Mock Mobile Sign-In endpoint
  http.post(`${baseUrl}/auth/v1/mobile`, async ({ request }) => {
    const { phone, token } = await request.json() as { 
      phone: string;
      token: string;
    };

    if (phone && token) {
      return HttpResponse.json({
        user: {
          id: 'mobile-test-user-id',
          phone: phone,
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'mobile-test-access-token',
          refresh_token: 'mobile-test-refresh-token',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        }
      }, { status: 200 });
    }

    return HttpResponse.json({
      error: 'Invalid mobile credentials'
    }, { status: 400 });
  }),
  
  // Add more mocked endpoints as needed
]; 