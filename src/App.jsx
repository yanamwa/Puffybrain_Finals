import { Routes, Route } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

/* Landing */
import LandingPage from "./pages/LandingPage";
import Aboutus from "./pages/Landing_page/Aboutus";

/* Nav */
import FAQ from "./pages/faq/faq";

/* User Account */
import Login from "./pages/useraccount/Login";
import Signup from "./pages/useraccount/Signup";
import Otp from "./pages/useraccount/Otp";
import Forgot from "./pages/useraccount/Forgotpassword";
import ChangePassword from "./pages/useraccount/Changepassword";
import ForgotUsername from "./pages/useraccount/forgotuser";
import CantSign from "./pages/useraccount/cant_sign";
import ChangeUsername from "./pages/useraccount/Changeusername";

/* Introduction */
import Welcome from "./pages/introduction/Welcome";
import HowItWorks from "./pages/introduction/HowItWorks";
import School from "./pages/introduction/School";
import Year from "./pages/introduction/Year";
import Profile from "./pages/introduction/Profile";

/* Home */
import Loading from "./pages/User/loading";
import Homepage from "./pages/User/Homepage";
import PublicDeck from "./pages/public_decks/publicDeck";
import UserProfile from "./pages/User_profile/UserProfile";
import MyDecks from "./pages/User/Mydecks";
import MyCourse from "./pages/User/MyCourse";

/* Decks */
import DeckPage from "./pages/decks/DeckPage";
import UserDecks from "./pages/decks/userDecks";

/* Learning Module */
import Introduction from "./pages/Learning_Module/Introduction";
import LearningModule from "./pages/Learning_Module/LearningModule";
import Lesson from "./pages/Learning_Module/Lesson";

/* Admin */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ModuleManagement from "./pages/admin/modulemanagement";
import ModuleForm from "./pages/admin/ModuleForm";
import UserManagement from "./pages/admin/UserManagement";
import ModesManagement from "./pages/admin/Modesmangement";

/* Learning */
import FlashcardsTutorial from "./pages/quizzes/flashcards-tutorial";
import QandATutorial from "./pages/quizzes/QandA-tutorial";
import MultipleChoice from "./pages/quizzes/multipleChoice-Tutorial";
import MatchingTutorial from "./pages/quizzes/matching-tutorial";
import SurvivalTutorial from "./pages/quizzes/survivaltutorial";

/* Quizzes */
import Flashcards from "./pages/inQuiz/realFlashcard";
import MatchingType from "./pages/inQuiz/matching";
import Multiple from "./pages/inQuiz/multiplechoice";
import QandA from "./pages/inQuiz/qanda";
import Survival from "./pages/inQuiz/survival";

/* Results */
import Result from "./pages/quizResults/results";

export default function App() {
  return (
    <Routes>
      {/* LANDING PAGES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<Aboutus />} />

      {/* USER ACCOUNTS */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/changepassword" element={<ChangePassword />} />
      <Route path="/forgot-username" element={<ForgotUsername />} />
      <Route path="/cant-signin" element={<CantSign />} />
      <Route path="/change-username" element={<ChangeUsername />} />

      {/* USER INTRODUCTION */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/school" element={<School />} />
      <Route path="/year" element={<Year />} />
      <Route path="/profile" element={<Profile />} />

      {/* HOME */}
      <Route path="/loading" element={<Loading />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/mydecks" element={<MyDecks />} />
      <Route path="/public-decks" element={<PublicDeck />} />
      <Route path="/user-profile" element={<UserProfile />} />
      <Route path="/mycourse" element={<MyCourse />} />

      {/* DECKS */}
      <Route path="/deckpage" element={<DeckPage />} />
      <Route path="/deck/:deckId" element={<UserDecks />} />

      {/* LEARNING FLOW */}
      <Route path="/learning/:lessonId" element={<LearningModule />} />
      <Route path="/introduction/:lessonId" element={<Introduction />} />
      <Route path="/lesson/:lessonId" element={<Lesson />} />

      {/* ADMIN */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/modes" element={<ModesManagement />} />

      <Route path="/admin/modules" element={<ModuleManagement />} />
      <Route path="/admin/modules/new" element={<ModuleForm mode="add" />} />
      <Route path="/admin/modules/edit/:id" element={<ModuleForm mode="edit" />} />

      {/* LEARNING */}
      <Route path="/module-management" element={<ModuleManagement />} />
      <Route path="/flashcards-tutorial" element={<FlashcardsTutorial />} />
      <Route path="/QandA-tutorial" element={<QandATutorial />} />
      <Route path="/multipleChoice-tutorial" element={<MultipleChoice />} />
      <Route path="/Matching-tutorial" element={<MatchingTutorial />} />
      <Route path="/Survival-tutorial" element={<SurvivalTutorial />} />

      {/* QUIZ */}
      <Route path="/flashcard/:lessonId" element={<Flashcards />} />
      <Route path="/matching-type/:lessonId" element={<MatchingType />} />
      <Route path="/multiple-choice/:lessonId" element={<Multiple />} />
      <Route path="/qna/:lessonId" element={<QandA />} />
      <Route path="/survival/:lessonId" element={<Survival />} />

      {/* RESULTS */}
      <Route path="/result" element={<Result />} />

      {/* NAVIGATION */}
      <Route path="/FAQ" element={<FAQ />} />

      {/* FALLBACK */}
      <Route path="*" element={<h1>Page not found</h1>} />
    </Routes>
  );
}