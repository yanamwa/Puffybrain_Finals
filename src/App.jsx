import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

/* User Account */
import Login from "./pages/useraccount/Login";
import Signup from "./pages/useraccount/Signup";
import Otp from "./pages/useraccount/Otp";

import PublicDeck from "./pages/useraccount/public_decks/publicDeck";

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

/* Admin */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";


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

 {/* ADMIN ROUTES */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
