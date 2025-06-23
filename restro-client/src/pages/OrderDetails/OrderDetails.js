import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button } from "antd";
import Modal from "../../components/Modal"; // Import the Modal component
import "./OrderDetails.css"; // Import the CSS file for styling
import { base_url } from "../../utils/apiList";
import SplitBillApp from "./SplitBill";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrderData = async (orderId) => {
    try {
      const token = localStorage.getItem("access_token"); 
      const response = await fetch(`${base_url}/orders/${orderId}`,{
        method: "GET", // Optional as GET is default
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add the Bearer token here
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  useEffect(() => {
    fetchOrderData(id);
  }, [id]);

  if (!orderData) return <div>Loading...</div>;


  const columns = [
    { title: "Item Id", dataIndex: "itemId" },
    { title: "Item Name", dataIndex: "itemName" },
    { title: "Quantity", dataIndex: "quantity" },
    {
      title: "Price (€)",
      dataIndex: "price",
      render: (price) => `€${price.toFixed(2)}`,
    },
    {
      title: "Total (€)",
      render: (_, record) => `€${(record.quantity * record.price).toFixed(2)}`,
    },
  ];

  // Calculate the total price for the order
  const totalPrice = orderData.orderItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  return (
    <div>
      <h2>Order Details</h2>
      <p>
        <b>Table Number:</b> {orderData.tableNumber}
      </p>
      <p>
        <b>Order Date:</b> {new Date(orderData.createdAt).toLocaleDateString()}
      </p>
      <Table
        columns={columns}
        dataSource={orderData.orderItems}
        rowKey="itemId"
        pagination={false}
      />

      <div className="split-bill-summary">
        <p>
          <b>Total Price:</b> €{totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Split Bill Button */}
      <div className="button-container">
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="split-bill-button"
        >
          Split Bill
        </Button>

        <button className="back-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>

      {/* Split Bill Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
      <SplitBillApp orderItems={orderData.orderItems} order={orderData}/>
        </Modal>
      )}
    </div>
  );
}
