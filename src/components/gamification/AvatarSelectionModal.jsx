
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User as UserIcon, Check, Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import NoAvatars from './NoAvatars';

export default function AvatarSelectionModal({ isOpen, onClose, avatars, onSelect, currentAvatarId, onUploadRequest, isUploading }) {

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if fallback image also fails
    e.target.style.display = 'none'; // Hide the broken image element
    const parentCard = e.target.closest('.avatar-card'); // Find the closest parent with class 'avatar-card'
    if (parentCard) {
      parentCard.style.display = 'none'; // Hide the entire card
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-gray-900 border-purple-500/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-purple-400">שנה את האוואטר שלך</DialogTitle>
          <DialogDescription className="text-gray-400">ההתקדמות והרמות שלך יישמרו.</DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto p-1">
          {avatars.length > 0 || true ? ( // Changed condition to always show upload option, even if no default avatars
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
              <Card
                  className="bg-gray-800/80 border border-dashed border-purple-500 cursor-pointer hover:border-purple-400 transition-all duration-300 flex flex-col items-center justify-center text-center"
                  onClick={() => !isUploading && onUploadRequest()}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center h-full"> {/* Added h-full to CardContent */}
                  {isUploading ? (
                      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                  ) : (
                      <Upload className="w-10 h-10 text-purple-400 mb-3" />
                  )}
                  <h2 className="text-lg font-bold text-white mt-2">העלה תמונה</h2>
                </CardContent>
              </Card>

              {avatars.map(avatar => (
                <Card 
                  key={avatar.id} 
                  className={`bg-gray-800 border avatar-card ${currentAvatarId === avatar.id ? 'border-purple-500' : 'border-gray-700'}`}
                >
                  <CardContent className="p-4 text-center">
                    <img 
                      src={avatar.thumbnail_url} 
                      alt={avatar.name} 
                      className="w-full h-auto rounded-md mb-4 aspect-square object-cover"
                      onError={handleImageError}
                    />
                    <h2 className="text-xl font-bold text-white mb-2">{avatar.name}</h2>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600"
                      disabled={currentAvatarId === avatar.id}
                      onClick={() => {
                          if (currentAvatarId !== avatar.id) {
                            onSelect(avatar.id);
                            onClose();
                          }
                      }}
                    >
                      {currentAvatarId === avatar.id ? 'האוואטר הנוכחי' : 'בחר'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8">
              <NoAvatars />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
