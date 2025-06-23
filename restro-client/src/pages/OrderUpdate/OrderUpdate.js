import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderForm from "../OrderForm/OrderFormer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { base_url } from "../../utils/apiList";
import axiosInstance from "../../utils/AxiosInstance";

export default function OrderUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrderData = async (orderId) => {
    try {
      // Use axios to make the GET request
      const response = await axiosInstance.get(`/orders/${orderId}`);
      
      // Assuming the response data structure is the same as in the original fetch request
      const data = response.data;
      
      // Set initial data with the API response
      setInitialData({
        tableNumber: data.tableNumber,
        orderDate: new Date(data.createdAt).toISOString().slice(0, 10),
        pickupOrder: data.pickupOrder,
        onlineOrder: data.onlineOrder,
        address: data.address,
        orderItems: data.orderItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price,
          category: item.category
        })),
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  useEffect(() => {
    fetchOrderData(id);
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      const response = await axiosInstance.put(`/orders/${id}`, {...payload})

      if (response.status === 200) {
        toast.success("Order updated successfully!", {
          position: "top-right",
        });
        navigate("/");
      } 
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${base_url}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Order status updated successfully!", {
          position: "top-right",
        });
        navigate("/");
      } else {
        toast.error(result.message || "Failed to update order status.", {
          position: "top-right",
        });
        throw new Error(result.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderForm
      title="Update Order"
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      formType="update"
      onStatusChange={handleStatusChange}
    />
  );
}
