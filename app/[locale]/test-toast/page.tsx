'use client';

import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/Button';

export default function TestToastPage() {
  const { showToast } = useNotification();

  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Toast Notification Test</h1>
        <p className="text-gray-600 mb-8">
          Click the buttons below to test different toast notifications.
          The toast should appear above the navigation bar.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            onClick={() => showToast('Success! This is a success message that should appear above the navbar.', 'success')}
          >
            Show Success Toast
          </Button>

          <Button
            variant="secondary"
            onClick={() => showToast('Error! Something went wrong. This message should be visible above the navbar.', 'error')}
          >
            Show Error Toast
          </Button>

          <Button
            variant="outline"
            onClick={() => showToast('Warning! Please be careful. This warning should not be hidden by the navbar.', 'warning')}
          >
            Show Warning Toast
          </Button>

          <Button
            variant="outline"
            onClick={() => showToast('Info: This is an informational message displayed above all other elements.', 'info')}
          >
            Show Info Toast
          </Button>
        </div>

        <div className="mt-12 p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Z-Index Reference</h2>
          <ul className="space-y-2 text-sm">
            <li>• Navbar: z-[60]</li>
            <li>• Dropdown menus: z-[100]</li>
            <li>• Modals: z-[200]</li>
            <li className="text-green-600 font-semibold">• Toast notifications: z-[9999] (highest priority)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}