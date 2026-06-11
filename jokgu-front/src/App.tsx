import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css'
import Login from './pages/users/Login';
import Signup from './pages/users/Signup';
import Main from './pages/Main';
import FieldList from './pages/fields/FieldList';
import FieldDetail from './pages/fields/FieldDetail';
import FieldCreate from './pages/fields/FieldCreate';
import GroupList from './pages/groups/GroupList';
import GroupDetail from './pages/groups/GroupDetail';
import GroupCreate from './pages/groups/GroupCreate';
import ScheduledPlans from './pages/plans/ScheduledPlans';
import PlanCreate from './pages/plans/PlanCreate';
import PlanDetail from './pages/plans/PlanDetail';
import MatchCreate from './pages/matches/MatchCreate';
import MatchDetail from './pages/matches/MatchDetail';
import Layout from './pages/Layout';import { AnimatePresence } from 'framer-motion';
import Mypage from './pages/users/Mypage';
;


export default function App() {

  const location = useLocation();

  return (
    <AnimatePresence mode='wait'>

    <Routes location={location} key={location.pathname}>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/main" />} />
        <Route path="/main" element={<CheckToken><Main /></CheckToken>} />
        <Route path='/Mypage' element={<CheckToken><Mypage /></CheckToken>}/>

        <Route path="/fields" element={<CheckToken><FieldList /></CheckToken>} />
        <Route path='/fields/:fid' element={<CheckToken><FieldDetail /></CheckToken>} />
        <Route path='/fields/create' element={<CheckToken><FieldCreate /></CheckToken>} />

        <Route path='/groups' element={<CheckToken><GroupList /></CheckToken>} />
        <Route path='/groups/create' element={<CheckToken><GroupCreate /></CheckToken>} />
        <Route path='/groups/:gid' element={<CheckToken><GroupDetail /></CheckToken>} />
        <Route path='/groups/:gid/create' element={<CheckToken><PlanCreate /></CheckToken>} />

        <Route path='/plans' element={<CheckToken><ScheduledPlans /></CheckToken>} />
        <Route path='/plans/:pid' element={<CheckToken><PlanDetail /></CheckToken>} />
        <Route path='/plans/:pid/newmatch' element={<CheckToken><MatchCreate /></CheckToken>} />

        <Route path='/plans/:pid/matches/:mid' element={<CheckToken><MatchDetail /></CheckToken>} />
      </Route>
    </Routes>
    </AnimatePresence>
  )
}

function CheckToken({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" />
}