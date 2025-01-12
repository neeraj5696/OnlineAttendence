import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'
import Login from '../pages/Login';
import Signup from '../pages/Signup';
// import NotFound from '../pages/NotFound';

function App() {
  return (
    <Router>
      <div>
        <Routes>       
          <Route path="/" element={<Home />} />  
          <Route path="/login" element={<Login />} />  
          <Route path="/signup" element={<Signup />} /> 
          {/* <Route path="*" element={<NotFound />} />   */}
        </Routes>
      </div>
    </Router>

  )
}

export default App