import React, { useEffect, useState } from "react";
import "./Bookings.css";
import { Button, Table } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import Modal from "../../components/Modal";
import BookingForm from "../../components/BookingForm";
import { toast } from "react-toastify";
import moment from "moment";
import axiosInstance from "../../utils/AxiosInstance";


const Bookings = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialValues = {
    bookingDate: new Date().toISOString().split("T")[0], // Today's date in the format YYYY-MM-DD
    numberOfPeople: 0,
    bookingName: "",
    bookingTime: "",
    phoneNumber: "",
    hour: "",
    minute: "",
  };

  // Fetch reservations data
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/reservations`);
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(); // Fetch data when the component mounts
  }, []); // Empty dependency array means this runs only on component mount

  const handleBookingSubmit = async (payload) => {
    try {
      delete payload.hour;
      delete payload.minute;

      const response = await axiosInstance.post(`/reservations`, {
        ...payload,
      });
      if (response?.status === 201) {
        toast.success("Order Booking created successfully!", {
          position: "top-right",
        });
        // Trigger re-fetch after successfully creating a booking
        fetchReservations();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message, {
        position: "top-right",
      });
    } finally {
      setModalOpen(false); // Close the modal after submission
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this item?");
      if (!confirmDelete) return;

      const response = await axiosInstance.delete(`/reservations/${id}`);
      if (response?.status === 200) {
        toast.success("Reservation deleted successfully!", {
          position: "top-right",
        });
        fetchReservations(); // Re-fetch reservations after deletion
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error deleting reservation", {
        position: "top-right",
      });
    }
  };
  

  const bookingColumns = [
    {
      title: "Booking Id",
      render: (_, record, index) => index + 1, // Display the serial number (starting from 1)
    },
    { title: "Booking Name", dataIndex: "bookingName" },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      render: (_, record) =>
        new Date(record.bookingDate).toISOString().split("T")[0],
    },
    { title: "Number Of People", dataIndex: "numberOfPeople" },
    { title: "Booking Time", dataIndex: "bookingTime" },
    { title: "Phone Number", dataIndex: "phoneNumber" },
    {
      title: "Days Left",
      key: "daysLeft",
      className: "days-left-column",
      render: (_, record) => {
        const today = moment().startOf("day");
        const bookingDate = moment(record.bookingDate).startOf("day");
        const daysLeft = bookingDate.diff(today, "days");

        // Return the calculated value or indicate the booking has passed
        if (daysLeft > 0) {
          return `${daysLeft} days`;
        } else if (daysLeft === 0) {
          return "Today";
        } else {
          return "Passed";
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          danger
          onClick={() => handleDelete(record.id)} // Use the reservation's ID
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="booking-container">
      <div className="create-booking-button">
        <Button
          icon={<FileAddOutlined />}
          onClick={() => setModalOpen(true)}
          block
        >
          Create Booking
        </Button>
      </div>
      <Table
        columns={bookingColumns}
        dataSource={reservations} // Provide your data source here
        loading={loading}
        rowKey="bookingId"
        scroll={{ x: "max-content" }}
        className="booking-table"
      />
      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)} size="small">
          <BookingForm
            initialValues={initialValues}
            handleFormSubit={handleBookingSubmit}
          />
        </Modal>
      )}
    </div>
  );
};

export default Bookings;
