import { Routes, Route } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

import GuestRoute from "./GuestRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ProtectedUserRoute from "./ProtectedUserRoute";

/* ================= LANDING ================= */
import LandingPage from "./pages/LandingPage";
import Aboutus from "./pages/Landing_page/Aboutus";
import ContactUs from "./pages/Landing_page/ContactUs/ContactUs";
import FAQ from "./pages/faq/faq";
import NotFound from "./pages/NotFound";

/* ================= USER ACCOUNT ================= */
import Login from "./pages/useraccount/Login";
import Signup from "./pages/useraccount/Signup";
import Otp from "./pages/useraccount/Otp";
import Forgot from "./pages/useraccount/Forgotpassword";
import ChangePassword from "./pages/useraccount/Changepassword";
import ForgotUsername from "./pages/useraccount/forgotuser";
import CantSign from "./pages/useraccount/Cant_sign";
import ChangeUsername from "./pages/useraccount/Changeusername";
import EditProfile from "./pages/User_profile/edit-profile";
import RecoverAccount from "./pages/useraccount/RecoverAccount";

/* ================= INTRO ================= */
import Welcome from "./pages/Introduction/Welcome";
import HowItWorks from "./pages/Introduction/HowItWorks";
import School from "./pages/Introduction/School";
import Year from "./pages/Introduction/Year";
import Profile from "./pages/Introduction/Profile";

/* ================= USER ================= */
import Loading from "./pages/User/Loading";
import Homepage from "./pages/User/Homepage";
import PublicDeck from "./pages/public_decks/publicDeck";
import UserProfile from "./pages/User_profile/UserProfile";
import MyDecks from "./pages/User/Mydecks";
import MyCourse from "./pages/User/MyCourse";
import LoggedFaq from "./pages/User/loggedfaq";

/* ================= DECKS ================= */
import DeckPage from "./pages/decks/DeckPage";
import UserDecks from "./pages/decks/userDecks";

/* ================= LEARNING ================= */
import Introduction from "./pages/Learning_Module/Introduction";
import LearningModule from "./pages/Learning_Module/LearningModule";
import Lesson from "./pages/Learning_Module/Lesson";
import LessonResult from "./pages/Learning_Module/LessonResult";

/* ================= TUTORIALS ================= */
import FlashcardsTutorial from "./pages/quizzes/flashcards-tutorial";
import QandATutorial from "./pages/quizzes/QandA-tutorial";
import MultipleChoice from "./pages/quizzes/multipleChoice-Tutorial";
import MatchingTutorial from "./pages/quizzes/matching-tutorial";
import SurvivalTutorial from "./pages/quizzes/survivaltutorial";
import TimedQuizTutorial from "./pages/quizzes/timedquiz-tutorial";

/* ================= QUIZZES ================= */
import Flashcards from "./pages/inQuiz/realFlashcard";
import MatchingType from "./pages/inQuiz/matching";
import Multiple from "./pages/inQuiz/multiplechoice";
import QandA from "./pages/inQuiz/qanda";
import Survival from "./pages/inQuiz/survival";
import TimedQuiz from "./pages/inQuiz/timedinquiz";

/* ================= ADMIN ================= */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ModuleManagement from "./pages/admin/modulemanagement";
import AddModule from "./pages/admin/AddModule";
import EditModule from "./pages/admin/EditModule";
import UserManagement from "./pages/admin/usermanagement";
import ModesManagement from "./pages/admin/Modesmangement";
import DecksManagement from "./pages/admin/DecksManagement";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSetting";
import NotificationManagement from "./pages/admin/NotificationModule";
import AdminBackupRestore from "./pages/admin/BackupRestore";

export default function App() {
  return (
    <Routes>
      {/* ================= GUEST ONLY ================= */}
      <Route element={<GuestRoute />}>
        {/* Landing pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/Landing/FAQ" element={<FAQ />} />

        {/* User auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/forgot-username" element={<ForgotUsername />} />
        <Route path="/cant-signin" element={<CantSign />} />
        <Route path="/recover-account" element={<RecoverAccount />} />     
        <Route path="/pb-admin-access" element={<AdminLogin />} />

      </Route>

      {/* ================= PUBLIC ================= */}
      <Route path="/otp" element={<Otp />} />

      {/* ================= USER PROTECTED ================= */}
      <Route element={<ProtectedUserRoute />}>
        {/* Account */}
        <Route path="/change-username" element={<ChangeUsername />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Intro */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/school" element={<School />} />
        <Route path="/year" element={<Year />} />
        <Route path="/profile" element={<Profile />} />

        {/* User Pages */}
        <Route path="/loading" element={<Loading />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/mydecks" element={<MyDecks />} />
        <Route path="/public-decks" element={<PublicDeck />} />
        <Route path="/mycourse" element={<MyCourse />} />
        <Route path="/FAQ" element={<LoggedFaq />} />

        {/* Profile */}
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/user-profile/:userId" element={<UserProfile />} />

        {/* Decks */}
        <Route path="/deckpage" element={<DeckPage />} />
        <Route path="/deck/:deckId" element={<UserDecks />} />

        {/* Learning */}
        <Route path="/learning/:lessonId" element={<LearningModule />} />
        <Route path="/introduction/:lessonId" element={<Introduction />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/review/:lessonId" element={<LessonResult />} />
        <Route path="/review/deck/:deckId" element={<LessonResult />} />

        {/* Tutorials - Lesson */}
        <Route
          path="/flashcards-tutorial/lesson/:lessonId"
          element={<FlashcardsTutorial />}
        />
        <Route
          path="/multipleChoice-tutorial/lesson/:lessonId"
          element={<MultipleChoice />}
        />
        <Route
          path="/Matching-tutorial/lesson/:lessonId"
          element={<MatchingTutorial />}
        />
        <Route
          path="/Survival-tutorial/lesson/:lessonId"
          element={<SurvivalTutorial />}
        />
        <Route
          path="/QandA-tutorial/lesson/:lessonId"
          element={<QandATutorial />}
        />
        <Route
          path="/timedquiz-tutorial/lesson/:lessonId"
          element={<TimedQuizTutorial />}
        />

        {/* Tutorials - Deck */}
        <Route
          path="/flashcards-tutorial/deck/:deckId"
          element={<FlashcardsTutorial />}
        />
        <Route
          path="/multipleChoice-tutorial/deck/:deckId"
          element={<MultipleChoice />}
        />
        <Route
          path="/Matching-tutorial/deck/:deckId"
          element={<MatchingTutorial />}
        />
        <Route
          path="/Survival-tutorial/deck/:deckId"
          element={<SurvivalTutorial />}
        />
        <Route
          path="/QandA-tutorial/deck/:deckId"
          element={<QandATutorial />}
        />
        <Route
          path="/timedquiz-tutorial/deck/:deckId"
          element={<TimedQuizTutorial />}
        />

        {/* Quizzes - Lesson */}
        <Route path="/flashcard/lesson/:lessonId" element={<Flashcards />} />
        <Route path="/matching-type/lesson/:lessonId" element={<MatchingType />} />
        <Route path="/multiple-choice/lesson/:lessonId" element={<Multiple />} />
        <Route path="/qna/lesson/:lessonId" element={<QandA />} />
        <Route path="/survival/lesson/:lessonId" element={<Survival />} />
        <Route path="/timedquiz/lesson/:lessonId" element={<TimedQuiz />} />

        {/* Quizzes - Deck */}
        <Route path="/flashcard/deck/:deckId" element={<Flashcards />} />
        <Route path="/matching-type/deck/:deckId" element={<MatchingType />} />
        <Route path="/multiple-choice/deck/:deckId" element={<Multiple />} />
        <Route path="/qna/deck/:deckId" element={<QandA />} />
        <Route path="/survival/deck/:deckId" element={<Survival />} />
        <Route path="/timedquiz/deck/:deckId" element={<TimedQuiz />} />
      </Route>

      {/* ================= ADMIN PROTECTED ================= */}
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/modes" element={<ModesManagement />} />
        <Route path="/admin/modules" element={<ModuleManagement />} />
        <Route path="/admin/modules/new" element={<AddModule />} />
        <Route path="/admin/modules/edit/:id" element={<EditModule />} />
        <Route path="/admin/decks" element={<DecksManagement />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<NotificationManagement />} />
        <Route path="/admin/backup-restore" element={<AdminBackupRestore />} />
      </Route>

      {/* ================= 404 ================= */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}