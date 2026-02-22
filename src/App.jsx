import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/useraccount/Login";
import Signup from "./pages/useraccount/Signup";
import Otp from "./pages/useraccount/Otp";
import Homepage from "./pages/useraccount/homepage";
import PublicDeck from "./pages/useraccount/public_decks/publicDeck";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/public-decks" element={<PublicDeck />} />


    </Routes>
  );
}

export default App;
