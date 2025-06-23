import { Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderCreate from "./pages/OrderCreate/OrderCreate";
import OrderUpdate from "./pages/OrderUpdate/OrderUpdate";
import OrderList from "./pages/OrderList/OrderList";
import OrderDetails from "./pages/OrderDetails/OrderDetails";
import Sidebar from "./components/Sidebar";
import "./App.css";
import Bookings from "./pages/Bookings/Bookings";
import Menu from "./pages/Menu/Menu";
import OrderReport from "./pages/Report/OrderReport";
import Login from "./pages/Login/Login";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  const [isModelOpen,setModelOpen]= useState(false)
  const [isAuthenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  console.log("isAuthenticated",isAuthenticated)
  const checkToken = () => {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now(); // Check expiration
        if (!isExpired) {
          setAuthenticated(true);
          setModelOpen(false);
          return;
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
    setAuthenticated(false); // Token is invalid or expired
    setModelOpen(true); // Open login modal
  };

  const handleLogout = () => {
    window.localStorage.removeItem("access_token"); // Clear token
    setAuthenticated(false); // Update authentication state
    setModelOpen(true); // Reopen the login modal
    navigate("/"); // Redirect to the login page
  };

  useEffect(()=>{
    checkToken();
    
  },[])

  return (
    <div className="main-content">
      {isAuthenticated && <Sidebar className="sidebar" onLogout={handleLogout} />}
      <div className="heading">The Indian Tadka</div>
        <div className={isModelOpen ? '' : 'content'}>
        <Routes>
          <Route path="/" element={isAuthenticated ? (
            <OrderList />) : ( <Login isModelOpen={isModelOpen} setModelOpen={setModelOpen} setLogin={setAuthenticated} />)} />

          <Route path="/orderCreate" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrderCreate />
              </ProtectedRoute>} />
          <Route path="/orderUpdate/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrderUpdate />
              </ProtectedRoute>} />
          <Route path="/orderDetails/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrderDetails />
              </ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                <Bookings />
              </ProtectedRoute>} />
          <Route path="/menu" element={
                <Menu />}
               />
          <Route path="/report" element={ <ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrderReport />
              </ProtectedRoute>} />
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
