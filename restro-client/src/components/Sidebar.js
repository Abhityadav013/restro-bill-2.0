import React, { useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { MdRestaurant } from "react-icons/md";
import { FiCalendar } from "react-icons/fi";
import { FaBars, FaTimes } from "react-icons/fa"; // Hamburger menu
import "./Sidebar.css";
import BookingForm from "./BookingForm";
import Modal from "./Modal";
import { toast } from "react-toastify";
import axios from "axios";
import { base_url } from "../utils/apiList";
import { FaHome } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { TbReport } from "react-icons/tb";
import { RiLogoutBoxLine } from "react-icons/ri";

const Sidebar = ({onLogout}) => {
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const initialValues = useState({
    bookingDate: new Date().toISOString().split("T")[0], // Today's date in the format YYYY-MM-DD
    numberOfPeople: 0,
    bookingName: "",
    bookingTime: "",
    phoneNumber: "",
    hour: "",
    minute: "",
  });

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleBookingSubmit = async (payload) => {
    try {
      delete payload.hour;
      delete payload.minute;
      const response = await axios.post(`${base_url}/booking`, {
        ...payload,
      });
      if (response?.status === 201) {
        toast.success("Order Booking created successfully!", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message, {
        position: "top-right",
      });
    } finally {
      setReservation(false);
    }
  };


  const handleHomeButton = () => {
    navigate("/");
    toggleSidebar();
  };

  const handleOrderButton = () => {
    navigate("/orderCreate");
    toggleSidebar();
  };

  const handleReservation = () => {
    navigate("/booking"); 
    toggleSidebar();
  };

  const handleMenu = () => {
    navigate("/menu"); 
    toggleSidebar();
  };

  const handleReport = () => {
    navigate("/report"); 
    toggleSidebar();
  };

  return (
    <div>
      <div className="hamburger-icon" onClick={toggleSidebar}>
        {sidebarVisible ? <FaTimes /> : <FaBars />}
      </div>
      <div className={`sidebar ${sidebarVisible ? "visible" : ""}`}>
        <div className="logo-container">
          <img
            src={"/logo.png"}
            alt="Restaurant Logo"
            className="sidebar-logo"
            onClick={() => navigate("/")}
          />
        </div>

        <Button className="sidebar-btn" icon={<FaHome />} onClick={() => handleHomeButton()}>
          <span className="sidebar-text">Home</span>
        </Button>
        <Button className="sidebar-btn" icon={<MdRestaurant />} onClick={() => handleOrderButton()}>
          <span className="sidebar-text">Order</span>
        </Button>
        <Button className="sidebar-btn" icon={<FiCalendar />} onClick={() => handleReservation()}>
          <span className="sidebar-text">Reservation</span>
        </Button>
        <Button className="sidebar-btn" icon={<MdMenuBook />} onClick={() => handleMenu()}>
          <span className="sidebar-text">Menu</span>
        </Button>
        <Button className="sidebar-btn" icon={<TbReport />} onClick={() => handleReport()}>
          <span className="sidebar-text">Report</span>
        </Button>
        <Button className="sidebar-btn logout-btn" icon={<RiLogoutBoxLine />} onClick={onLogout}>
          <span className="sidebar-text">Logout</span>
        </Button>
        {reservation && (
          <Modal onClose={() => setReservation(false)} size="small">
            <BookingForm initialValues={initialValues} handleFormSubit={handleBookingSubmit} />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
