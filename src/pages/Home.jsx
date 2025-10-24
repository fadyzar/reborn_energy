import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        await User.me();
        // User is logged in, redirect to the main dashboard
        navigate(createPageUrl('Dashboard'));
      } catch (error) {
        // User is not logged in, show the login page content
        // which will be handled by the layout (showing the login button)
        // For now, we can show a login prompt here as well.
        // Or we just let the layout handle it. Let's redirect to Dashboard page
        // as it will become the main entry point for logged-out view.
        navigate(createPageUrl('Dashboard'));
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // This content will be briefly visible if not logged in, before layout shows login button
  return null;
}