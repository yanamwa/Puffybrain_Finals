import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import 'boxicons/css/boxicons.min.css';

/* User Account */
import Login from "./pages/useraccount/Login";
import Signup from "./pages/useraccount/Signup";
import Otp from "./pages/useraccount/Otp";
import Forgot from "./pages/useraccount/Forgotpassword";
import ChangePassword from "./pages/useraccount/Changepassword";

import Welcome from "./pages/introduction/Welcome";
import HowItWorks from "./pages/introduction/HowItWorks";
import School from "./pages/introduction/School";
import Year from "./pages/introduction/Year";
import Profile from "./pages/introduction/Profile";

/* Home */
import Loading from "./pages/User/loading";
import Homepage from "./pages/User/Homepage";
import PublicDeck from "./pages/useraccount/public_decks/publicDeck";
import UserProfile from "./pages/User_profile/UserProfile";

/*Decks*/
import DeckPage from "./pages/decks/DeckPage"; 
import AddNewCard from "./pages/decks/AddNewCard";

/* Admin */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ModuleManagement from "./pages/admin/ModuleManagement";
import UserManagement from "./pages/admin/usermanagement";
import LearningModule from "./pages/Learning_Module/LearningModule";

function App() {
  return (
    <Routes>
      {/* USER ACCOUNTS */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/changepassword" element={<ChangePassword />} />

     {/* USER INTRODUCTION */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/school" element={<School />} /> 
      <Route path="/year" element={<Year />} />
      <Route path="/profile" element={<Profile />} />

    {/* HOME */}
      <Route path="/loading" element={<Loading />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/public-decks" element={<PublicDeck />} />
      <Route path="/module-management" element={<ModuleManagement />} />
      <Route path="/learning/:lessonId" element={<LearningModule />} />
      <Route path="/user-profile" element={<UserProfile />}/>

    {/* DECKS */}
      <Route path="/deckpage" element={<DeckPage/>} />
      <Route path="/addnewcard" element={<AddNewCard />} />

{/* ADMIN ROUTES */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement/>} />
      <Route path="/admin/modules" element={<ModuleManagement />} />
      <Route path="*" element={<h1>Page not found</h1>} />
    </Routes>
    
  );
}

export default App;