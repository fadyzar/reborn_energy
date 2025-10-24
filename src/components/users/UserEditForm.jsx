
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X, Loader2 } from "lucide-react"; // Added Loader2
import { User } from "@/api/entities";
import { Group } from "@/api/entities";

export default function UserEditForm({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    hebrew_name: user.hebrew_name || "",
    phone: user.phone || "",
    birth_date: user.birth_date ? user.birth_date.split('T')[0] : "",
    gender: user.gender || "",
    height: user.height || "",
    activity_level: user.activity_level || "",
    goal: user.goal || "",
    daily_calories_goal: user.daily_calories_goal || "",
    daily_protein_goal: user.daily_protein_goal || "",
    daily_carbs_goal: user.daily_carbs_goal || "",
    daily_fat_goal: user.daily_fat_goal || "",
    is_coach: user.is_coach || false,
    group_id: user.group_id || "",
    coach_id: user.coach_id || "", // Added coach_id
  });
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState([]);
  const [coaches, setCoaches] = useState([]); // State for coaches list
  const [currentUser, setCurrentUser] = useState(null); // State for current logged-in user
  const [loadingData, setLoadingData] = useState(true); // Replaced loadingGroups with general loadingData

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const me = await User.me();
        setCurrentUser(me);

        let fetchedGroups = [];
        let fetchedCoaches = [];

        if (me.role === 'admin') {
          // Admin can see all groups and all coaches
          fetchedGroups = await Group.list();
          const allUsers = await User.list();
          fetchedCoaches = allUsers.filter(u => u.is_coach);
        } else if (me.is_coach) {
          // A coach can only see and assign to their own groups
          fetchedGroups = await Group.filter({ coach_id: me.id });
          // A coach doesn't manage other coaches, so no need to fetch all coaches
        }
        
        setGroups(fetchedGroups);
        setCoaches(fetchedCoaches);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
      setLoadingData(false);
    };

    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onUpdate(user.id, formData);
      setSaving(false);
      onClose();
      
      // אם שינינו את הסטטוס של המשתמש הנוכחי, נרענן את הדף
      const loggedInUser = await User.me(); // Fetch current logged-in user to check if it's the one being edited
      if (user.id === loggedInUser.id) { // Check if the updated user is the current logged-in user
        window.location.reload(); // Reload the page to reflect changes, especially if coach status changed
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setSaving(false); // Reset saving state even on error
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>עריכת פרופיל - {user.hebrew_name || user.full_name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            
            {currentUser?.role === 'admin' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                <h4 className="font-bold text-red-800">הגדרות מנהל</h4>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_coach"
                    checked={formData.is_coach}
                    onCheckedChange={(checked) => handleInputChange('is_coach', checked)}
                  />
                  <Label htmlFor="is_coach" className="font-medium">האם מאמן?</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coach_id">שיוך למאמן</Label>
                  <Select
                    value={formData.coach_id || ""}
                    onValueChange={(value) => handleInputChange('coach_id', value === "null" ? null : value)}
                    disabled={loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "טוען מאמנים..." : "בחר מאמן"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"null"}>ללא שיוך</SelectItem>
                      {coaches.map(coach => (
                        <SelectItem key={coach.id} value={coach.id}>
                          {coach.hebrew_name || coach.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {currentUser?.is_coach && currentUser?.role !== 'admin' && (
               <div className="flex items-center space-x-2 space-x-reverse p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Switch
                    id="is_coach_display"
                    checked={formData.is_coach}
                    disabled={true} // Coaches cannot change this status
                  />
                  <Label htmlFor="is_coach_display" className="font-medium">האם מאמן?</Label>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hebrew_name">שם בעברית</Label>
                <Input
                  id="hebrew_name"
                  value={formData.hebrew_name}
                  onChange={(e) => handleInputChange('hebrew_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">תאריך לידה</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">מין</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מין" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="זכר">זכר</SelectItem>
                    <SelectItem value="נקבה">נקבה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">גובה (ס"מ)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity_level">רמת פעילות</Label>
                <Select
                  value={formData.activity_level}
                  onValueChange={(value) => handleInputChange('activity_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר רמת פעילות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="מינימלי">מינימלי</SelectItem>
                    <SelectItem value="קל">קל</SelectItem>
                    <SelectItem value="בינוני">בינוני</SelectItem>
                    <SelectItem value="גבוה">גבוה</SelectItem>
                    <SelectItem value="מאוד גבוה">מאוד גבוה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">מטרה</Label>
              <Select
                value={formData.goal}
                onValueChange={(value) => handleInputChange('goal', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מטרה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ירידה במשקל">ירידה במשקל</SelectItem>
                  <SelectItem value="שמירה על משקל">שמירה על משקל</SelectItem>
                  <SelectItem value="עלייה במשקל">עלייה במשקל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="group">שיוך לחוג</Label>
                <Select
                  value={formData.group_id || ""}
                  onValueChange={(value) => handleInputChange('group_id', value === "null" ? null : value)}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "טוען חוגים..." : "בחר חוג"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"null"}>ללא שיוך</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">יעדים יומיים</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_calories_goal">קלוריות</Label>
                  <Input id="daily_calories_goal" type="number" value={formData.daily_calories_goal} onChange={(e) => handleInputChange('daily_calories_goal', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_protein_goal">חלבון</Label>
                  <Input id="daily_protein_goal" type="number" value={formData.daily_protein_goal} onChange={(e) => handleInputChange('daily_protein_goal', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_carbs_goal">פחמימות</Label>
                  <Input id="daily_carbs_goal" type="number" value={formData.daily_carbs_goal} onChange={(e) => handleInputChange('daily_carbs_goal', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_fat_goal">שומן</Label>
                  <Input id="daily_fat_goal" type="number" value={formData.daily_fat_goal} onChange={(e) => handleInputChange('daily_fat_goal', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" /> // Changed div spinner to Loader2
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              {saving ? "שומר..." : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
