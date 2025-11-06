import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import VerifyEmail from "./pages/VerifyEmail"
import { PrivateRoute } from "./services/useAuth"

function App() {
  return (
    <Routes> 
        <Route path="/" element={<PrivateRoute> <Home /> </PrivateRoute>} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/verify/sendEmail" element={<VerifyEmail />} />
        <Route path="/auth/password/request" element={<ForgotPassword />} />
        <Route path="/auth/password/reset/:userId/:resetString" element={<ResetPassword />} />
    </Routes>
  )
}

export default App
