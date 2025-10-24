
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Mail, Phone, Settings, UserCheck, UserX, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

import InviteUserForm from "../components/users/InviteUserForm";
import UserEditForm from "../components/users/UserEditForm";

// רכיב משתמש גמיש למובייל
function UserListItem({ user, onEdit, currentUser }) {
  const canEdit = currentUser.role === 'admin' || 
    (currentUser.is_coach && user.coach_id === currentUser.id);

  const getRoleBadge = (role, isCoach) => {
    if (role === 'admin') return <Badge className="bg-red-100 text-red-800 text-xs">מנהל</Badge>;
    if (isCoach) return <Badge className="bg-purple-100 text-purple-800 text-xs">מאמן</Badge>;
    return <Badge className="bg-blue-100 text-blue-800 text-xs">מתאמן</Badge>;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
      {/* פרטי משתמש */}
      <div className="flex items-center gap-3 min-w-0 flex-grow basis-60">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {(user.hebrew_name || user.full_name || 'U')[0]}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {user.hebrew_name || user.full_name || 'משתמש'}
          </h3>
          <p className="text-gray-600 text-sm truncate">{user.email}</p>
        </div>
      </div>

      {/* סטטוס ופעולות */}
      <div className="flex flex-col items-end flex-shrink-0">
        <div className="flex items-center gap-4">
          {getRoleBadge(user.role, user.is_coach)}
          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(user)}
              className="hover:bg-blue-50 h-9 w-9"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1">
          הצטרף: {format(new Date(user.created_date), "dd/MM/yy")}
        </span>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterBy, setFilterBy] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!user) return; // Simplified initial check

    try {
      let relevantUsers = [];
      
      if (user.role === 'admin') {
        // Admin sees ALL users
        console.log('[UserManagement] Loading all users for admin');
        const users = await User.list('-created_date', 500); // Increased limit for admin
        relevantUsers = users;
      } else if (user.is_coach) {
        // Coach sees only their trainees
        console.log('[UserManagement] Loading trainees for coach ID:', user.id);
        try {
          const coachTrainees = await User.filter({ coach_id: user.id });
          relevantUsers = [...coachTrainees, user]; // Include coach himself in the list
        } catch (error) {
          console.error("Error loading trainees for coach:", error);
          if (error.message && error.message.includes('401')) {
            console.log('[UserManagement] 401 error - token may have expired');
            // Instead of setting empty array, we should handle this better
            throw error; // Re-throw to be caught by the outer try-catch for consistent handling
          }
          relevantUsers = [user]; // Only include coach if trainees can't be loaded
        }
      }
      
      console.log('[UserManagement] Loaded users:', relevantUsers.length);
      setAllUsers(relevantUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      if (error.message && error.message.includes('401')) {
        // Token expired or unauthorized
        setAllUsers([]);
        // Optionally trigger a re-login or redirect to login
        console.log('[UserManagement] Authorization error - may need to re-login');
      } else {
        setAllUsers([]);
      }
    }
  }, [user]); // Dependency: 'user' object to re-run when user context changes

  const applyFiltersAndSort = useCallback(() => {
    let filtered = allUsers.filter(u => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = 
        (u.hebrew_name && u.hebrew_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (u.full_name && u.full_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (u.email && u.email.toLowerCase().includes(lowerCaseSearchTerm));

      const matchesFilter = filterBy === "all" || 
        (filterBy === "coaches" && u.is_coach) ||
        (filterBy === "trainees" && !u.is_coach) ||
        (filterBy === "admins" && u.role === 'admin');

      return matchesSearch && matchesFilter;
    });

    // Sort by name
    filtered.sort((a, b) => 
      (a.hebrew_name || a.full_name || '').localeCompare(b.hebrew_name || b.full_name || '')
    );

    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, filterBy]); // Dependencies: state variables that affect filtering/sorting

  useEffect(() => {
    loadUser();
  }, []); // Only runs once on component mount

  useEffect(() => {
    loadUsers();
  }, [loadUsers]); // Runs when loadUsers callback changes (which depends on 'user')

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]); // Runs when applyFiltersAndSort callback changes

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      console.log('[UserManagement] Current user loaded:', currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading current user:", error);
      setUser(null); // Set user to null if loading fails, preventing infinite loading or incorrect state
    }
    setLoading(false);
  };

  const handleUserUpdate = useCallback(async (userId, updates) => {
    try {
      await User.update(userId, updates);
      setEditingUser(null);
      loadUsers(); // Reload users after update
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }, [loadUsers]); // Dependency: 'loadUsers' callback

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || (!user.is_coach && user.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">אין הרשאה</h2>
        <p className="text-gray-600">עמוד זה זמין רק למאמנים ומנהלים</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              ניהול משתמשים
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              ניהול פרטי משתמשים בסיסיים והרשאות
            </p>
          </div>

          <Button 
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-gradient-to-r from-blue-500 to-green-500 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            הזמן משתמש חדש
          </Button>
        </div>

        {/* Controls - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search - Mobile First */}
            <div className="sm:col-span-2 lg:col-span-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="חיפוש משתמש..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-sm sm:text-base"
              />
            </div>

            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="text-sm sm:text-base">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="סינון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המשתמשים</SelectItem>
                <SelectItem value="admins">מנהלים</SelectItem>
                <SelectItem value="coaches">מאמנים</SelectItem>
                <SelectItem value="trainees">מתאמנים</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats */}
            <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center bg-gray-50 rounded-lg p-2">
              {filteredUsers.length} מתוך {allUsers.length} משתמשים
            </div>
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="mb-4 sm:mb-6">
            <InviteUserForm 
              onClose={() => setShowInviteForm(false)}
              coachId={user.id}
            />
          </div>
        )}

        {/* Users List - Simple List for Mobile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">רשימת משתמשים</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">אין משתמשים</h3>
                <p className="text-sm sm:text-base text-gray-500">נסה לשנות את הסינון או הזמן משתמש חדש</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredUsers.map((userItem) => (
                  <UserListItem 
                    key={userItem.id}
                    user={userItem}
                    onEdit={setEditingUser}
                    currentUser={user}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        {editingUser && (
          <UserEditForm
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUpdate={handleUserUpdate}
          />
        )}
      </div>
    </div>
  );
}
