import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, MessageCircle, Pin, Trophy, HelpCircle, 
  Image as ImageIcon, FileText, Send, Play, Download, 
  ExternalLink, Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const getPostTypeConfig = (type) => {
  const configs = {
    text: { icon: FileText, color: 'bg-blue-100 text-blue-800', label: 'טקסט' },
    photo: { icon: ImageIcon, color: 'bg-green-100 text-green-800', label: 'מדיה' },
    achievement: { icon: Trophy, color: 'bg-yellow-100 text-yellow-800', label: 'הישג' },
    question: { icon: HelpCircle, color: 'bg-purple-100 text-purple-800', label: 'שאלה' },
  };
  return configs[type] || configs.text;
};

export default function CommunityPostComponent({ 
  post, 
  comments, 
  user, 
  onLike, 
  onComment, 
  onShowComments,
  onPin, 
  isCoach 
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const postConfig = getPostTypeConfig(post.post_type);
  const IconComponent = postConfig.icon;

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };
  
  const handleToggleComments = () => {
    const newShowState = !showComments;
    setShowComments(newShowState);
    if (newShowState) {
      onShowComments(post.id);
    }
  };

  const formatMediaFiles = (post) => {
    const mediaFiles = post.media_files || [];
    // גם תמיכה בשדה image_url הישן לתאימות לאחור
    if (post.image_url && !mediaFiles.find(f => f.url === post.image_url)) {
      mediaFiles.unshift({ 
        url: post.image_url, 
        type: 'image', 
        name: 'תמונה' 
      });
    }
    return mediaFiles;
  };

  const mediaFiles = formatMediaFiles(post);

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {(post.author_hebrew_name || 'U')[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">
                    {post.author_hebrew_name}
                  </p>
                  {post.author_is_coach && (
                    <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1">
                      מאמן
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {format(new Date(post.created_date), 'dd/MM/yy HH:mm', { locale: he })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${postConfig.color} text-xs px-2 py-1`}>
                <IconComponent className="w-3 h-3 ml-1" />
                {postConfig.label}
              </Badge>
              {isCoach && (
                <Button variant="ghost" size="icon" onClick={() => onPin(post.id)}>
                  <Pin className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* תוכן הפוסט */}
          <div className="mb-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* גלריית מדיה */}
          {mediaFiles.length > 0 && (
            <div className="mb-4">
              <div className={`grid gap-2 ${
                mediaFiles.length === 1 ? 'grid-cols-1' : 
                mediaFiles.length === 2 ? 'grid-cols-2' : 
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {mediaFiles.map((media, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                    onClick={() => setSelectedMedia(media)}
                  >
                    {media.type === 'image' ? (
                      <div className="relative">
                        <img 
                          src={media.url} 
                          alt={media.name || 'תמונה'}
                          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <video 
                          src={media.url}
                          className="w-full h-48 object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <Badge className="bg-black/60 text-white text-xs">
                            וידאו
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* תגיות */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* כפתורי פעולה */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4 ml-1" />
                {post.likes_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleComments}
                className="text-gray-600 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4 ml-1" />
                {post.comments_count || 0}
              </Button>
            </div>
            
            {mediaFiles.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ImageIcon className="w-3 h-3" />
                {mediaFiles.length} קבצים
              </div>
            )}
          </div>

          {/* תגובות */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {comments.length > 0 && (
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-800">
                          {comment.author_name || 'משתמש'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(comment.created_date), 'dd/MM HH:mm')}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="כתוב תגובה..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[60px] resize-none bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* מודל תצוגת מדיה בגודל מלא */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt="תמונה מוגדלת"
                className="block max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <video 
                src={selectedMedia.url}
                controls 
                className="block max-w-full max-h-[90vh] rounded-lg"
                autoPlay
              />
            )}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-12 right-0 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors text-xl"
            >
              ✕
            </button>
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-white text-sm">
                {selectedMedia.name} • לחץ כדי לסגור
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}