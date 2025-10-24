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
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/DailyTracking" element={<DailyTracking />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/BodyMetrics" element={<BodyMetrics />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/CoachDashboard" element={<CoachDashboard />} />
                
                <Route path="/UpgradePlan" element={<UpgradePlan />} />
                
                <Route path="/Recipes" element={<Recipes />} />
                
                <Route path="/PersonalAnalytics" element={<PersonalAnalytics />} />
                
                <Route path="/CommandCenter" element={<CommandCenter />} />
                
                <Route path="/Community" element={<Community />} />
                
                <Route path="/MyTrainees" element={<MyTrainees />} />
                
                <Route path="/TraineeProfile" element={<TraineeProfile />} />
                
                <Route path="/PaymentSettings" element={<PaymentSettings />} />
                
                <Route path="/GroupManagement" element={<GroupManagement />} />
                
                <Route path="/AvatarHub" element={<AvatarHub />} />
                
                <Route path="/AvatarLeague" element={<AvatarLeague />} />
                
                <Route path="/WorkoutLogPage" element={<WorkoutLogPage />} />
                
                <Route path="/CoachAvatarHub" element={<CoachAvatarHub />} />
                
                <Route path="/BusinessSettingsPage" element={<BusinessSettingsPage />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}