import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderForm from "../OrderForm/OrderFormer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the styles
import axiosInstance from "../../utils/AxiosInstance";

export default function OrderCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);

      const response = await axiosInstance.post(`/orders`, {
        ...payload
      });
      if (response?.status === 201) {
        // Only trigger success toast on success
        toast.success("Order created successfully!", {
          position: "top-right",
        });
        navigate("/");  // Navigate to the main page or wherever you want
      } 
    } catch (error) {
      toast.error(error?.response?.data?.message, {
        position: "top-right",  // Correct position value
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderForm title="Create Order" onSubmit={handleSubmit} isSubmitting={isSubmitting} formType="create" />
  );
}
