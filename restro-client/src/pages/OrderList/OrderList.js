import { Button, Table, Popconfirm, Dropdown, AutoComplete } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  PayCircleOutlined, // Payment icon
  PrinterOutlined,
} from "@ant-design/icons"; // Import icons for status update
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the styles
import "./OrderList.css";
import { base_url } from "../../utils/apiList";
import BookingForm from "../../components/BookingForm";
import Modal from "../../components/Modal";
import { getOrderType } from "../../utils/orderType";
import axiosInstance from "../../utils/AxiosInstance";

function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // For search term input
  const [isBookingTable, setBookingTable] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1, // Set default current page
    pageSize: 8, // Default page size is 10
  });
  const [totalCount, setTotalCount] = useState(0);
  const [pageChange, setPageChange] = useState(false);

  const initialValues = {
    bookingDate: new Date().toISOString().split("T")[0], // Today's date in the format YYYY-MM-DD
    numberOfPeople: 0,
    bookingName: "",
    bookingTime: "",
    phoneNumber: "",
    hour: "",
    minute: "",
  };

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSearchSelect = (value) => {
    setSearchTerm(value);
  };

  // Function to handle API call when search button is clicked
  const handleSearch = useCallback(async () => {
    try {
      const response = await axiosInstance.post(
        `/orders-listing`, 
        { search: searchTerm },
        {
          params: {
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
          },
        }
      );
  
      setOrders(response.data.orders);
      setTotalCount(response.data.pagination.totalCount);
      setFilteredOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders", error);
      setLoading(false);
      toast.error("Failed to fetch orders", { position: "top-right" });
    }
  }, [searchTerm, pagination.currentPage, pagination.pageSize]); // Dependencies for the memoized function
  
  

  const handlePayment = async (record, paymentMethod) => {
    try {
      const response = await axiosInstance.put(
        `/orders/${record.orderId}/paymentMethod`,
        { paymentMethod }
      );
      if (response.status === 200) {
        toast.success("Order payment updated successfully", {
          position: "top-right",
        });
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === record.orderId
              ? { ...order, paymentMethod }
              : order
          )
        );
      }
    } catch (error) {
      toast.error(error.response.data.message, { position: "top-right" });
    }
  };

  const genrateOrder = async (record) => {
    try {
      const response = await axios.get(
        `${base_url}/generate-bill/${record.orderId}`,
        {
          responseType: "blob", // Ensure we handle the response as a Blob (binary data)
        }
      );

      // Create a URL for the Blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = `bill_${record.displayId}.pdf`; // Name the file
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Error:", error);
    }
  };

  const genrateOrderBill = async (record) => {
    try {
      const response = await axios.get(
        `${base_url}/generate-bill/${record.orderId}`,
        {
          responseType: "blob", // Ensure we handle the response as a Blob (binary data)
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank");
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.print();
        };
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error("Error generating the bill:", error);
      toast.error("Failed to generate the bill. Please try again.", {
        position: "top-right",
      });
    }
  };

  const handleDeleteRow = async (record) => {
    try {
      const response = await axiosInstance.delete(
        `/orders/${record.orderId}`
      );
      if (response.status === 200) {
        setOrders((prev) =>
          prev.filter((order) => order.orderId !== record.orderId)
        );
        toast.success("Order deleted successfully", { position: "top-right" });
      } else {
        toast.error("Failed to delete order. Please try again.", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error deleting order", error);
      toast.error("Failed to delete order. Please try again.", {
        position: "top-right",
      });
    }
  };

  const handleStatusChange = async (record, status) => {
    try {
      const response = await axiosInstance.put(
        `/orders/${record.orderId}/status`,
        { status }
      );
      if (response.status === 200) {
        toast.success("Order status updated successfully", {
          position: "top-right",
        });
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === record.orderId ? { ...order, status } : order
          )
        );
      } else {
        toast.error(response.error, { position: "top-right" });
      }
    } catch (error) {
      toast.error(error.response.data.message, { position: "top-right" });
    }
  };

  const orderListColumn = [
    {
      title: "OrderId",
      dataIndex: "displayId",
    },
    {
      title: "Order Type",
      dataIndex: "orderType",
      render: (_, record) => getOrderType(record),
    },
    {
      title: "Table Number",
      dataIndex: "tableNumber",
      render: (_, record) => (record?.tableNumber ? record?.tableNumber : "-"),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      render: (_, record) =>
        new Date(record.createdAt).toISOString().split("T")[0],
    },
    {
      title: "Order Price",
      render: (_, record) =>
        `€${record.orderItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)}`,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => genrateOrder(record)}
            icon={<DownloadOutlined />}
          />
          <Button
            type="link"
            onClick={() => genrateOrderBill(record)}
            icon={<PrinterOutlined />}
          />

          <Button
            type="link"
            onClick={() => navigate(`/orderDetails/${record.orderId}`)}
            icon={<EyeOutlined />}
          />
          {!record.paymentMethod && record.status !== "COMPLETED" && (
            <Button
              type="link"
              onClick={() => navigate(`/orderUpdate/${record.orderId}`)}
              icon={<EditOutlined />}
            />
          )}

          <Popconfirm
            title="Are you sure you want to delete this order?"
            onConfirm={() => handleDeleteRow(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          {!record.paymentMethod && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    label: "Cash",
                    onClick: () => handlePayment(record, "Cash"),
                  },
                  {
                    key: "2",
                    label: "Card",
                    onClick: () => handlePayment(record, "Card"),
                  },
                  {
                    key: "3",
                    label: "Paypal",
                    onClick: () => handlePayment(record, "Paypal"),
                  },
                ],
              }}
            >
              <Button
                type="link"
                icon={<PayCircleOutlined />}
                disabled={record.paymentMethod}
              >
                {record.paymentMethod}
              </Button>
            </Dropdown>
          )}

          {record.paymentMethod && record.status !== "COMPLETED" && (
            <Button
              type="link"
              onClick={() => handleStatusChange(record, "COMPLETED")}
              icon={<CheckCircleOutlined />}
            >
              Complete
            </Button>
          )}
        </>
      ),
    },
    {
      title: "Order Status",
      dataIndex: "status",
      render: (text, record) => record.status,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      render: (text, record) => record.paymentMethod,
    },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/orders`, {
        params: {
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
        },
      });
      setOrders(response.data.orders);
      setTotalCount(response.data.pagination.totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders", error);
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize]); // Use only pagination values as dependencies
  
  useEffect(() => {
    if (searchTerm !== "") {
      handleSearch();
    } else {
      fetchOrders();
    }
  }, [pageChange, searchTerm, fetchOrders, handleSearch]);

  const handleBookingSubmit = async (payload) => {
    try {
      delete payload.hour;
      delete payload.minute;
      const response = await axiosInstance.post(`/booking`, {
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
      setBookingTable(false);
    }
  };

  const handlePageChange = ({ pageSize, current }) => {
    if (pagination.pageSize !== pageSize || pagination.current !== current) {
      setPageChange(true);
    }
    setPagination(prev => ({
      currentPage: current,    // Update current page
      pageSize: pageSize,      // Update page size
    }));
  };

  return (
    <div className="centered-container">
      <div className="search-box-container">
        <AutoComplete
          size="large"
          style={{ flex: 1 }} // Use flex to make it responsive
          options={searchSuggestions.map((suggestion) => ({
            value: suggestion.value,
            label: suggestion.label,
          }))}
          value={searchTerm}
          onSelect={handleSearchSelect}
          onChange={handleSearchChange}
          placeholder="Search Orders"
          className="search-input"
        />
        <Button type="primary" onClick={handleSearch} className="search-button">
          Search
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={orderListColumn}
          rowKey="orderId"
          dataSource={filteredOrders}
          loading={loading}
          onChange={handlePageChange} // Use the handler to update pagination
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["5", "8", "15", "20"],
            total: totalCount,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} orders`,
          }}
        />
      </div>
      {isBookingTable && (
        <Modal onClose={() => setBookingTable(false)}>
          <BookingForm
            initialValues={initialValues}
            handleFormSubit={handleBookingSubmit}
          />
        </Modal>
      )}
    </div>
  );
}

const searchSuggestions = [
  {
    id: "257a2c23-e29d-4e4d-b73d-25fb5cd06e36",
    label: "View Order By OrderId",
    value: "displayId: ",
  },
  {
    id: "6c614790-f1d7-46c5-be4c-94e668dd9cfe",
    label: "View Order By Table Number",
    value: "tableNumber: ",
  },
  {
    id: "b9b339e4-eeb5-4ac1-aa0d-4481149006da",
    label: "View Pickup Order",
    value: "pickupOrder: ",
  },
  {
    id: "acf8330f-8ddc-4f91-8151-5db18566f99e",
    label: "View Order By Order Date",
    value: `orderDate: ${new Date().toISOString().split("T")[0]}`,
  },
  {
    id: "18bbce31-f944-49d2-9522-5cf95f927e9c",
    label: "View Order By Status",
    value: "status: COMPLETED ",
  },
  {
    id: "e4c289ff-9f07-4607-9d7a-f68632db2c14",
    label: "View Order By Payment Method",
    value: "paymentMethod: Cash",
  },
];

export default OrderList;
