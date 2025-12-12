import React from 'react';
import { Mail, Calendar } from 'lucide-react';

interface SyncDropdownProps {
  onClose: () => void;
}

const SyncDropdown: React.FC<SyncDropdownProps> = ({ onClose }) => {
  const handleSync = (provider: string) => {
    // Placeholder for sync functionality
    console.log(`Syncing with ${provider}`);
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
      <div className="py-1">
        <button
          onClick={() => handleSync('Google')}
          className="w-full px-4 py-2 text-sm text-left text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
        >
          <Mail className="h-4 w-4 text-red-500" />
          Google Calendar
        </button>
        <button
          onClick={() => handleSync('Outlook')}
          className="w-full px-4 py-2 text-sm text-left text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
        >
          <Calendar className="h-4 w-4 text-blue-500" />
          Outlook Calendar
        </button>
      </div>
    </div>
  );
};

export default SyncDropdown;
