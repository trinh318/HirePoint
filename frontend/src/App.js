import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/UI/NavBar";
import HomePage from "./components/pages/home-main/HomePage";
import BestJobBoard from "./components/pages/job/BestJobBoard";
import FindJobBoard from "./components/pages/job/FindJobBoard";
import JobRecommendation from "./components/pages/job/JobRecommendation";
import JobDetail from "./components/pages/job/JobDetail";
import Footer from "./components/UI/Footer";
import TopCompany from "./components/pages/company/TopCompany";
import CompanyDetail from "./components/pages/company/CompanyDetail";
import SignIn from "./components/pages/authentication/SignIn";
import SignUp from "./components/pages/authentication/SignUp";
import Jobs from "./components/pages/job/SearchJob"
import BlogHome from "./components/pages/blog/BlogHome";
import RecruiterDashboard from "./components/pages/recruiter/RecruiterDashboard";
import ApplicantDashboard from "./components/pages/applicant/ApplicantDashboard";
import AdminDashboard from "./components/pages/admin/AdminDashboard";
import JobSaved from "./components/pages/job/JobSaved";
import RecruiterSignIn from "./components/pages/authentication/RecruiterSignIn";
import RecruiterSignUp from "./components/pages/authentication/RecruiterSignUp";
import RecruiterHomePage from "./components/pages/recruiter/RecruiterHomePage";
import ApplicantProfile from "./components/pages/recruiter/ApplicantProfile";
import Applicant from "./components/pages/admin/Applicant";
import ScrollToTop from "./hooks/ScrollToTop";
import TestEdit from "./components/pages/recruiter/TestEdit";
import Profile from "./components/pages/recruiter/Profile";

function Layout() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/sign-in" || location.pathname === "/sign-up" || location.pathname === "/recruiter-sign-in" || location.pathname === "/recruiter-homepage" || location.pathname === "/recruiter-sign-in" || location.pathname === "/recruiter-sign-up";

  return (
    <>
      {!hideHeaderFooter && <Navbar />}
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/applicant-page" element={<HomePage />} />
        <Route exact path="/jobs/bestjobs" element={<BestJobBoard />} />
        <Route exact path="/jobs/findjobs" element={<FindJobBoard />} />
        <Route exact path="/jobs/job-recommendation" element={<JobRecommendation />} />
        <Route exact path="/jobs/job-saved" element={<JobSaved />} />
        <Route exact path="/jobs/jobdetail/:id" element={<JobDetail />} key={location.pathname} />
        <Route exact path="/companies" element={<TopCompany />} />
        <Route exact path="/companies/companydetail/:companyId" element={<CompanyDetail />} />
        <Route exact path="/sign-in" element={<SignIn />} />
        <Route exact path="/sign-up" element={<SignUp />} />
        <Route exact path="/search-job" element={<Jobs />} />
        <Route exact path="/blog-home" element={<BlogHome />} />
        <Route exact path="/admin-page" element={<AdminDashboard />} />
        <Route exact path="/recruiter-page" element={<RecruiterDashboard />} />
        <Route exact path="/applicant-dashboard" element={<ApplicantDashboard />} />
        <Route exact path="/recruiter-sign-in" element={<RecruiterSignIn />} />
        <Route exact path="/recruiter-sign-up" element={<RecruiterSignUp />} />
        <Route exact path="/recruiter-homepage" element={<RecruiterHomePage />} />
        <Route exact path="/applicants/applicant-profile/:applicantId" element={<ApplicantProfile />} />
        <Route exact path="/applicants/applicant-profile/viewed/:applicantId" element={<Profile />} />
        <Route exact path="/admin/applicant-profile/:userId" element={<Applicant />} />
        <Route path="/tests/edit/:id" element={<TestEdit />} /> 
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Thêm vào Router để theo dõi thay đổi đường dẫn */}
      <Layout />
    </Router>
  );
}

export default App;
