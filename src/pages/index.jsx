import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "./Layout.jsx";

const Dashboard = lazy(() => import("./Dashboard"));
const DailyTracking = lazy(() => import("./DailyTracking"));
const Calendar = lazy(() => import("./Calendar"));
const BodyMetrics = lazy(() => import("./BodyMetrics"));
const Analytics = lazy(() => import("./Analytics"));
const UserManagement = lazy(() => import("./UserManagement"));
const Home = lazy(() => import("./Home"));
const CoachDashboard = lazy(() => import("./CoachDashboard"));
const UpgradePlan = lazy(() => import("./UpgradePlan"));
const Recipes = lazy(() => import("./Recipes"));
const PersonalAnalytics = lazy(() => import("./PersonalAnalytics"));
const CommandCenter = lazy(() => import("./CommandCenter"));
const Community = lazy(() => import("./Community"));
const MyTrainees = lazy(() => import("./MyTrainees"));
const TraineeProfile = lazy(() => import("./TraineeProfile"));
const PaymentSettings = lazy(() => import("./PaymentSettings"));
const GroupManagement = lazy(() => import("./GroupManagement"));
const AvatarHub = lazy(() => import("./AvatarHub"));
const AvatarLeague = lazy(() => import("./AvatarLeague"));
const WorkoutLogPage = lazy(() => import("./WorkoutLogPage"));
const CoachAvatarHub = lazy(() => import("./CoachAvatarHub"));
const BusinessSettingsPage = lazy(() => import("./BusinessSettingsPage"));
const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">טוען...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}