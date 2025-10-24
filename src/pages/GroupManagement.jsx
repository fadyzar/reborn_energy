
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { Group } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Users, X, Info, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

function GroupCard({ group, onDelete, canDelete }) {
    const handleDelete = () => {
        if (confirm(`האם אתה בטוח שברצונך למחוק את החוג "${group.name}"?`)) {
            onDelete(group.id);
        }
    };

    return (
        <Card className="bg-white hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        {group.name}
                    </CardTitle>
                    {canDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 text-sm">{group.description || "אין תיאור לחוג זה."}</p>
            </CardContent>
        </Card>
    );
}

export default function GroupManagement() {
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);

            let fetchedGroups = [];
            if (currentUser.role === 'admin') {
                // Admin sees all groups in the system
                fetchedGroups = await Group.list('-created_date');
            } else if (currentUser.is_coach) {
                // A coach sees only their own groups
                fetchedGroups = await Group.filter({ coach_id: currentUser.id }, '-created_date');
            }
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || !user) return;
        setIsSaving(true);
        try {
            await Group.create({
                name: newGroupName,
                description: newGroupDescription,
                coach_id: user.id, // For admin or coach, creator is the coach
            });
            setNewGroupName('');
            setNewGroupDescription('');
            setShowForm(false);
            await loadData();
        } catch (error) {
            console.error("Error creating group:", error);
        }
        setIsSaving(false);
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            await Group.delete(groupId);
            await loadData(); // רענון הרשימה
        } catch (error) {
            console.error("Error deleting group:", error);
            alert("שגיאה במחיקת החוג. נסה שוב.");
        }
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        );
    }

    if (!user || (!user.is_coach && user.role !== 'admin')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">אין הרשאה</h2>
                <p className="text-gray-600">עמוד זה זמין רק למאמנים ומנהלים.</p>
            </div>
        );
    }

    const canCreate = user.is_coach || user.role === 'admin';

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-500" />
                            ניהול חוגים
                        </h1>
                        <p className="text-gray-600 mt-1">צור ונהל את הקהילות הפרטיות שלך.</p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="w-4 h-4 ml-2" />
                            צור חוג חדש
                        </Button>
                    )}
                </div>

                {showForm && canCreate && (
                    <Card className="mb-8 bg-white shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>יצירת חוג חדש</span>
                                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="group-name">שם החוג</Label>
                                <Input
                                    id="group-name"
                                    placeholder="לדוגמה: חיטוב קיץ 2024, רצים למרתון, מועדון 6 בבוקר"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>
                             <div>
                                <Label htmlFor="group-description">תיאור קצר (אופציונלי)</Label>
                                <Textarea
                                    id="group-description"
                                    placeholder="לדוגמה: קבוצה ממוקדת לירידה באחוזי שומן וחיטוב הגוף לקיץ. נפגשים 3 פעמים בשבוע ותומכים זה בזה."
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">💡 רעיונות לחוגים:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• <strong>לפי מטרה:</strong> "חיטוב קיץ", "בניית שריר", "ירידה במשקל"</li>
                                    <li>• <strong>לפי זמן:</strong> "מועדון 6 בבוקר", "אימוני ערב", "אתגר סוף שבוע"</li>
                                    <li>• <strong>לפי סוג אימון:</strong> "רצים למרתון", "חובבי כוח", "יוגה ומדיטציה"</li>
                                    <li>• <strong>לפי גיל/קבוצה:</strong> "אמהות בכושר", "גברים 40+", "נוער פעיל"</li>
                                </ul>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleCreateGroup} disabled={isSaving || !newGroupName.trim()}>
                                    {isSaving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                                    {isSaving ? "יוצר..." : "צור חוג"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>החוגים במערכת ({groups.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                           {groups.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groups.map(group => {
                                        // Admin can delete any group, coach can only delete their own
                                        const canDeleteGroup = user.role === 'admin' || group.coach_id === user.id;
                                        return (
                                            <GroupCard
                                                key={group.id}
                                                group={group}
                                                onDelete={handleDeleteGroup}
                                                canDelete={canDeleteGroup}
                                            />
                                        );
                                    })}
                                </div>
                           ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <Info className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700">אין חוגים להצגה</h3>
                                    {canCreate ? (
                                        <p className="text-gray-500 mt-2">לחץ על "צור חוג חדש" כדי להתחיל.</p>
                                    ) : (
                                        <p className="text-gray-500 mt-2">לא נוצרו עדיין חוגים במערכת.</p>
                                    )}
                                </div>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
