import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import DailyTracking from "./DailyTracking";

import Calendar from "./Calendar";

import BodyMetrics from "./BodyMetrics";

import Analytics from "./Analytics";

import UserManagement from "./UserManagement";

import Home from "./Home";

import CoachDashboard from "./CoachDashboard";

import UpgradePlan from "./UpgradePlan";

import Recipes from "./Recipes";

import PersonalAnalytics from "./PersonalAnalytics";

import CommandCenter from "./CommandCenter";

import Community from "./Community";

import MyTrainees from "./MyTrainees";

import TraineeProfile from "./TraineeProfile";

import PaymentSettings from "./PaymentSettings";

import GroupManagement from "./GroupManagement";

import AvatarHub from "./AvatarHub";

import AvatarLeague from "./AvatarLeague";

import WorkoutLogPage from "./WorkoutLogPage";

import CoachAvatarHub from "./CoachAvatarHub";

import BusinessSettingsPage from "./BusinessSettingsPage";

import Login from "./Login";

import Register from "./Register";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    DailyTracking: DailyTracking,
    
    Calendar: Calendar,
    
    BodyMetrics: BodyMetrics,
    
    Analytics: Analytics,
    
    UserManagement: UserManagement,
    
    Home: Home,
    
    CoachDashboard: CoachDashboard,
    
    UpgradePlan: UpgradePlan,
    
    Recipes: Recipes,
    
    PersonalAnalytics: PersonalAnalytics,
    
    CommandCenter: CommandCenter,
    
    Community: Community,
    
    MyTrainees: MyTrainees,
    
    TraineeProfile: TraineeProfile,
    
    PaymentSettings: PaymentSettings,
    
    GroupManagement: GroupManagement,
    
    AvatarHub: AvatarHub,
    
    AvatarLeague: AvatarLeague,
    
    WorkoutLogPage: WorkoutLogPage,
    
    CoachAvatarHub: CoachAvatarHub,
    
    BusinessSettingsPage: BusinessSettingsPage,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/DailyTracking" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <DailyTracking />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Calendar" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Calendar />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/BodyMetrics" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <BodyMetrics />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Analytics" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Analytics />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/UserManagement" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <UserManagement />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Home" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Home />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/CoachDashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <CoachDashboard />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/UpgradePlan" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <UpgradePlan />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Recipes" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Recipes />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/PersonalAnalytics" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <PersonalAnalytics />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/CommandCenter" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <CommandCenter />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Community" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Community />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/MyTrainees" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <MyTrainees />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/TraineeProfile" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <TraineeProfile />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/PaymentSettings" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <PaymentSettings />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/GroupManagement" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <GroupManagement />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/AvatarHub" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <AvatarHub />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/AvatarLeague" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <AvatarLeague />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/WorkoutLogPage" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <WorkoutLogPage />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/CoachAvatarHub" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <CoachAvatarHub />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/BusinessSettingsPage" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <BusinessSettingsPage />
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}