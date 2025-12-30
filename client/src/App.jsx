import { useContext } from 'react';
import './App.css';
import { Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import ApplyJob from './pages/ApplyJob';
import Applications from './pages/Applications';
import RecruiterLogin from './components/RecruiterLogin';
import { AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import ManageJobs from './pages/ManageJobs';
import ViewApplications from './pages/ViewApplications';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import 'quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { showRecruiterLogin } = useContext(AppContext);

  
  return (
    <>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Applications />} />
        <Route path='/resume-analyzer' element={<ResumeAnalyzer />} />
        <Route path='/job-matcher' element={<JobMatcher />} />

        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute> }>
          <Route path='add-job' element={ <AddJob /> } />
          <Route path='manage-jobs' element={ <ManageJobs /> } />
          <Route path='view-applications' element={ <ViewApplications /> } />
        </Route>
      </Routes>
    </>
  );
}

export default App;
