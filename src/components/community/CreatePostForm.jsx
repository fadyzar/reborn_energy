
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Send, X, Image, Video, FileText, Trophy, HelpCircle, 
  Upload, Loader2, Play, Trash2, Users
} from 'lucide-react';
import { UploadFile } from '@/api/integrations';

const postTypes = [
  { value: 'text', label: 'טקסט רגיל', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { value: 'photo', label: 'תמונה', icon: Image, color: 'bg-green-100 text-green-800' },
  { value: 'achievement', label: 'הישג אישי', icon: Trophy, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'question', label: 'שאלה', icon: HelpCircle, color: 'bg-purple-100 text-purple-800' },
];

export default function CreatePostForm({ onSubmit, onCancel, user, groups, isCoachOrAdmin }) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    if (isCoachOrAdmin && groups && groups.length > 1) {
      // If coach has multiple groups, default to empty to force selection
      return '';
    }
    // In all other cases (not coach, coach with 0 or 1 group),
    // the group is implicitly the user's default/general group (user.group_id).
    // If groups array exists and has 1 item, user.group_id should match groups[0].id
    return user.group_id;
  });
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef(null);

  const selectedType = postTypes.find(type => type.value === postType);

  const handleFileUpload = async (event) => {
    console.log('[CreatePostForm] File selection triggered. Files:', event.target.files);
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    console.log('[CreatePostForm] Uploading started...');
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          url: file_url,
          type: file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'other'),
          name: file.name
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setMediaFiles(prev => [...prev, ...uploadedFiles]);
      console.log('[CreatePostForm] Files uploaded successfully:', uploadedFiles);

      // אם זה התמונה הראשונה, שנה את סוג הפוסט אוטומטית
      if (mediaFiles.length === 0 && uploadedFiles[0]?.type === 'image') {
        setPostType('photo');
      }
    } catch (error) {
      console.error("[CreatePostForm] Error uploading files:", error);
      alert("שגיאה בהעלאת הקבצים. נסה שוב.");
    }
    setUploading(false);
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    // Only enforce group selection if coach/admin and there are multiple groups to choose from
    if (isCoachOrAdmin && groups && groups.length > 1 && (!selectedGroupId || selectedGroupId === '')) {
        alert('יש לבחור חוג כדי לפרסם פוסט.');
        return;
    }

    const postData = {
      content: content.trim(),
      post_type: postType,
      tags: tags,
      image_url: mediaFiles[0]?.url || null, // לתאימות לאחור
      media_files: mediaFiles, // רשימה מלאה של כל הקבצים
      // Determine group_id: if coach/admin and multiple groups are available for selection, use selectedGroupId.
      // Otherwise (not coach, or coach with 0/1 group), use the user's default group_id.
      group_id: isCoachOrAdmin && groups && groups.length > 1 ? selectedGroupId : user.group_id,
    };

    onSubmit(postData);
    
    // איפוס הטופס
    setContent('');
    setPostType('text');
    setMediaFiles([]);
    setTags([]);
    setNewTag('');
    // Reset selectedGroupId based on initial logic
    setSelectedGroupId(() => {
      if (isCoachOrAdmin && groups && groups.length > 1) {
        return '';
      }
      return user.group_id;
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <Send className="w-5 h-5 text-blue-500" />
          צור פוסט חדש
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
          {/* Show group selection only if coach/admin has multiple groups */}
          {isCoachOrAdmin && groups && groups.length > 1 && (
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">פרסם בחוג:</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger>
                      <Users className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="בחר חוג" />
                  </SelectTrigger>
                  <SelectContent>
                      {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          )}

          {/* If coach/admin has no groups or only one (general) group, show info message */}
          {isCoachOrAdmin && (!groups || groups.length <= 1) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                הפוסט יתפרסם בחוג הכללי שלך. תוכל ליצור חוגים נוספים בדף "ניהול חוגים".
              </p>
            </div>
          )}
          
          {/* בחירת סוג פוסט */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">סוג הפוסט</Label>
            <div className="grid grid-cols-2 gap-2">
              {postTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setPostType(type.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                    postType === type.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

        {/* תוכן הפוסט */}
        <div>
          <Label htmlFor="content" className="text-sm font-semibold text-gray-700 mb-2 block">
            {postType === 'achievement' ? 'ספר על ההישג שלך!' :
             postType === 'question' ? 'מה השאלה שלך?' :
             postType === 'photo' ? 'תאר את התמונה:' : 'מה יש חדש?'}
          </Label>
          <Textarea
            id="content"
            placeholder={
              postType === 'achievement' ? 'לדוגמה: השלמתי היום 100 שכיבות סמיכה ברצף!' :
              postType === 'question' ? 'לדוגמה: איך אני יכול לשפר את המוטיבציה שלי?' :
              postType === 'photo' ? 'הוסף תיאור לתמונה...' : 'שתף מחשבות, הישגים או שאל שאלות...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-white border-gray-300 focus:border-blue-500 resize-none"
          />
        </div>

        {/* העלאת מדיה */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">העלה תמונות או סרטונים</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-3">גרור קבצים לכאן או לחץ כדי לבחור</p>
            <Input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*"
              ref={fileInputRef}
            />
            <Button 
              variant="outline" 
              className="bg-white border-gray-300"
              onClick={() => {
                console.log('[CreatePostForm] "Select Files" button clicked.');
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 ml-2" />
              )}
              בחר קבצים
            </Button>
          </div>

          {/* תצוגה מקדימה של קבצים */}
          {mediaFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative group bg-gray-100 rounded-lg overflow-hidden border">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeMediaFile(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* תגיות */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">תגיות (אופציונלי)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="הוסף תגית..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1"
            />
            <Button type="button" onClick={addTag} size="sm" disabled={!newTag.trim()}>
              הוסף
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* כפתורי פעולה */}
        <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              ביטול
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() || uploading || (isCoachOrAdmin && groups && groups.length > 1 && !selectedGroupId)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg transition-all"
            >
              <Send className="w-4 h-4 ml-2" />
              {uploading ? 'מעלה...' : 'פרסם'}
            </Button>
          </div>
      </CardContent>
    </Card>
  );
}
