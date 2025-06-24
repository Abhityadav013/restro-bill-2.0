import React, { useEffect, useState, useRef } from 'react';
import { Table, Typography, Spin, Alert, Button, Checkbox } from 'antd';
import axiosInstance from '../utils/AxiosInstance';
import './OnlineReservationList.css';
import { io } from 'socket.io-client';
import { toast } from "react-toastify"
const { Title } = Typography;
;
function formatDateTime(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString(undefined, options);
}

const OnlineReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Sound logic
  const audioRef = useRef(null);
  const soundIntervalRef = useRef(null);
  const bellTimeoutRef = useRef(null);

  useEffect(() => {
    axiosInstance.get(`/online-reservations`)
      .then(res => {
        setReservations(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch reservations');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let socket;
    const setupSocketListeners = async () => {
      try {
        console.log('🔌 Setting up socket listeners in dashboard...');
        
        // Connect to the socket (SocketInitializer in layout already initialized the server)
        socket = io('http://localhost:8080');

        socket.on('connect', () => {
          console.log('✅ Socket.IO: Connected to order updates', socket.id);
        });

        socket.on('connect_error', (error) => {
          console.error('❌ Socket.IO: Connection error:', error);
        });

        // Listen for new orders

        socket.on('newBookingReceived', (newReservation) => {
          console.log('📨 Received new online booking:', newReservation);
          

          toast.success(`New reservation received: ${newReservation.displayId} - ${newReservation.fullName}`, {
            position: "top-right",
          });
          // // Add new reservation to the top of the list
           setReservations((prevReservations) => [newReservation, ...prevReservations]);
           if (newReservation.status === "draft") {
             // Start bell after 5 seconds
             if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
             bellTimeoutRef.current = setTimeout(() => {
               if (audioRef.current) {
                 audioRef.current.play();
                 soundIntervalRef.current = setInterval(() => {
                   audioRef.current.currentTime = 0;
                   audioRef.current.play();
                 }, 5000);
               }
             }, 5000);
           }
        });


      } catch (error) {
        console.error('❌ Error setting up socket listeners:', error);
      }
    };

    setupSocketListeners();

    // Cleanup function
    return () => {
      if (socket) {
        console.log('🔌 Cleaning up socket connection in dashboard');
        socket.disconnect();
      }
      if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []); // Empty dependency array - runs once on mount

  useEffect(() => {
    // Stop bell if no draft reservations
    const hasDrafts = reservations.some(r => r.status === "draft");
    if (!hasDrafts && soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [reservations]);

  // Table row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'draft',
      className: 'online-reservation-checkbox',
    }),
  };

  // Accept/Decline button handlers (to be implemented)
  const handleAccept = () => {
    // TODO: Implement backend call to accept selected reservations
    // For now, just update status in UI for demo
    setReservations((prev) => prev.map(r => selectedRowKeys.includes(r._id || r.displayId) ? { ...r, status: 'accepted' } : r));
    setSelectedRowKeys([]);
  };
  const handleDecline = () => {
    // TODO: Implement backend call to decline selected reservations
    setReservations((prev) => prev.map(r => selectedRowKeys.includes(r._id || r.displayId) ? { ...r, status: 'declined' } : r));
    setSelectedRowKeys([]);
  };

  const columns = [
    { title: 'Display ID', dataIndex: 'displayId', key: 'displayId', align: 'center' },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', align: 'center' },
    { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber', align: 'center' },
    { title: 'Number of People', dataIndex: 'numberOfPeople', key: 'numberOfPeople', align: 'center' },
    { title: 'Reservation Date/Time', dataIndex: 'reservationDateTime', key: 'reservationDateTime', align: 'center',
      render: (text) => formatDateTime(text)
    },
  ];

  return (
    <div className="online-reservation-list-container">
      <audio ref={audioRef} src="/notificationbell.mp3" preload="auto" />
      <Title level={2} className="online-reservation-title">Online Reservations</Title>
      <div className="online-reservation-actions">
        <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={handleAccept}>Accept</Button>
        <Button danger disabled={selectedRowKeys.length === 0} onClick={handleDecline}>Decline</Button>
      </div>
      {loading && <div className="online-reservation-spin"><Spin size="large" /></div>}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Table
        columns={columns}
        dataSource={reservations}
        rowKey={record => record._id || record.displayId}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        className="online-reservation-table"
        rowClassName={record => record.status === 'draft' ? 'draft-reservation-row' : ''}
        rowSelection={rowSelection}
      />
    </div>
  );
} 
export default OnlineReservationList;