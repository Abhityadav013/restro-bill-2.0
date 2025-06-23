import React, { useState, useEffect, useCallback } from "react";
import { Button, Row, Col, Table, DatePicker } from "antd";
import moment from "moment";
import "./OrderReport.css";
import { toast } from "react-toastify";
import { getOrderType } from "../../utils/orderType";
import axiosInstance from "../../utils/AxiosInstance";

const { RangePicker } = DatePicker;

const OrderReport = () => {
  const [totalFilteredPrice, setTotalFilteredPrice] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1, // Set default current page
    pageSize: 8, // Default page size is 8
  });
  const [pageChange, setPageChange] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const search = [];

    if (selectedFilters.paymentMethod) {
      search.push(`paymentMethod: ${selectedFilters.paymentMethod}`);
    }

    if (selectedFilters.orderType) {
      search.push(`orderType:${selectedFilters.orderType}`);
    }

    if (selectedFilters.today) {
      search.push(`today:${selectedFilters.today}`);
    }
    if (selectedFilters.currentWeek) {
      search.push(`currentWeek:${selectedFilters.currentWeek}`);
    }
    if (selectedFilters.currentMonth) {
      search.push(`currentMonth:${selectedFilters.currentMonth}`);
    }
    if (selectedFilters.currentYear) {
      search.push(`currentYear:${selectedFilters.currentYear}`);
    }
    if (selectedFilters.dateRange) {
      const [startDate, endDate] = selectedFilters.dateRange;
      search.push(`dateRange:${startDate} TO ${endDate}`);
    }

    console.log("Filters applied:", search.join(" AND "));

    try {
      const response = await axiosInstance.post(
        `/orders-listing`,
        {
          search: search.join(" AND "),
        },
        {
          params: {
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
          },
        }
      );
      setOrders(response.data.orders);
      setTotalCount(response.data.pagination.totalCount);
      setTotalFilteredPrice(response.data.totalPrice); // Update total filtered price
    } catch (error) {
      setOrders([]);
      setTotalFilteredPrice(0); // Reset total price on error
      toast.error(error?.response?.data?.message, {
        position: "top-right", // Correct position value
      });
    } finally {
      setLoading(false); // Set loading to false after the request
    }
  }, [selectedFilters, pagination.currentPage, pagination.pageSize]);

  // UseEffect to call fetchData change

  useEffect(() => {
    fetchOrders();
  }, [pageChange, fetchOrders]);

  const toggleFilter = (filterKey, value) => {
    setSelectedFilters((prevState) => {
      const newFilters = { ...prevState };

      // If the new value is selected, apply the filter, else remove it
      if (newFilters[filterKey] === value) {
        delete newFilters[filterKey]; // Deselect
      } else {
        newFilters[filterKey] = value; // Select
      }

      // Clear conflicting date filters when applying a date-based filter
      if (
        ["today", "currentWeek", "currentMonth", "currentYear"].includes(
          filterKey
        )
      ) {
        // Clear other date-related filters when one is selected
        ["today", "currentWeek", "currentMonth", "currentYear"].forEach(
          (key) => {
            if (key !== filterKey) {
              delete newFilters[key]; // Remove any conflicting date filter
            }
          }
        );
      }

      // Clear the custom date range when applying a date-based filter
      if (
        ["today", "currentWeek", "currentMonth", "currentYear"].includes(
          filterKey
        )
      ) {
        delete newFilters.dateRange; // Clear custom date range if any
      }

      return newFilters;
    });
  };

  const handleDateFilterChange = (filter) => {
    const today = new Date().toISOString().split("T")[0];

    // Call the reusable toggle function with the appropriate filter key and value
    if (filter === "today") toggleFilter("today", today);
    else if (filter === "currentWeek") toggleFilter("currentWeek", today);
    else if (filter === "currentMonth") toggleFilter("currentMonth", today);
    else if (filter === "currentYear") toggleFilter("currentYear", today);
  };

  // Handle custom date filter change
  const handleCustomDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0].format("YYYY-MM-DD");
      const endDate = dates[1].format("YYYY-MM-DD");

      // Clear conflicting date filters using toggleFilter
      ["today", "currentWeek", "currentMonth", "currentYear"].forEach((key) => {
        toggleFilter(key, undefined); // Remove conflicting date filters
      });

      // Apply custom date range
      setSelectedFilters((prevState) => ({
        ...prevState,
        dateRange: [startDate, endDate],
      }));
    } else {
      // Clear custom date range using toggleFilter
      setSelectedFilters((prevState) => ({
        ...prevState,
        dateRange: undefined,
      }));
    }
  };

  const handleOrderTypeChange = (type) => {
    console.log("Order type selected:", type);
    toggleFilter("orderType", type); // Toggle the orderType filter
  };

  // Handle payment method filter change
  const handlePaymentMethodChange = (method) => {
    toggleFilter("paymentMethod", method); // Toggle the paymentMethod filter
  };

  const handlePageChange = ({ pageSize, current }) => {
    if (pagination.pageSize !== pageSize || pagination.current !== current) {
      setPageChange(true);
    }
    setPagination((prev) => ({
      currentPage: current,
      pageSize: pageSize,
    }));
  };

  const disabledDate = (current) => {
    // Disable all dates after today (future dates)
    return current && current > moment().endOf("day");
  };

  const calculateTotalPrice = () => {
    return orders
      .reduce((total, order) => {
        return (
          total +
          order.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )
        );
      }, 0)
      .toFixed(2); // Format the total price to 2 decimal places
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "displayId",
      key: "orderId",
    },
    {
      title: "Payment Type",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Order Type",
      dataIndex: "orderType",
      key: "orderType",
      render: (_, record) => getOrderType(record), // ✅ Pass the full record
    },
    {
      title: "Order Price ",
      dataIndex: "price",
      render: (_, record) =>
        `€${record.orderItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)}`,
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const items = [
    {
      key: "Cash",
      label: "Cash",
    },
    {
      key: "PayPal",
      label: "PayPal",
    },
    {
      key: "Card",
      label: "Card",
    },
  ];

  return (
    <div className="order-report-container">
      <Row gutter={[16, 16]}>
        <Col span={24} className="filter-buttons">
          <Button.Group>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("day").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("today")}
              className={selectedFilters?.today ? "selected" : ""}
            >
              Today
            </Button>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("week").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("currentWeek")}
              className={selectedFilters?.currentWeek ? "selected" : ""}
            >
              This Week
            </Button>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("month").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("currentMonth")}
              className={selectedFilters?.currentMonth ? "selected" : ""}
            >
              This Month
            </Button>
            <Button
              type={
                selectedFilters.dateRange?.[0] ===
                moment().startOf("year").toISOString()
                  ? "primary"
                  : "default"
              }
              onClick={() => handleDateFilterChange("currentYear")}
              className={selectedFilters?.currentYear ? "selected" : ""}
            >
              This Year
            </Button>
          </Button.Group>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="order-type-row">
        <Col span={24} className="filter-buttons">
          <Button.Group>
            <Button
              type={
                selectedFilters.orderType === "dine_in" ? "primary" : "default"
              }
              onClick={() => handleOrderTypeChange("dine_in")}
              className={
                selectedFilters?.orderType === "dine_in" ? "selected" : ""
              }
            >
              DINE-IN
            </Button>
            <Button
              type={
                selectedFilters.orderType === "pickup" ? "primary" : "default"
              }
              onClick={() => handleOrderTypeChange("pickup")}
              className={
                selectedFilters?.orderType === "pickup" ? "selected" : ""
              }
            >
              PICKUP
            </Button>
            <Button
              type={
                selectedFilters.orderType === "online" ? "primary" : "default"
              }
              onClick={() => handleOrderTypeChange("online")}
              className={
                selectedFilters?.orderType === "online" ? "selected" : ""
              }
            >
              ONLINE ORDER
            </Button>
          </Button.Group>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="payment-method-row">
        <Col span={24} className="filter-buttons">
          <Button.Group>
            {items.map(({ key, label }) => (
              <Button
                key={key}
                type={
                  selectedFilters.paymentMethod === key ? "primary" : "default"
                }
                onClick={() => handlePaymentMethodChange(key)}
                className={
                  selectedFilters.paymentMethod === key ? "selected" : ""
                }
              >
                {label}
              </Button>
            ))}
          </Button.Group>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="custom-date-row">
        <Col span={24}>
          <RangePicker
            value={
              selectedFilters.dateRange
                ? [
                    moment(selectedFilters.dateRange[0]),
                    moment(selectedFilters.dateRange[1]),
                  ]
                : null // If dateRange is undefined, set value to null (clears the RangePicker)
            }
            onChange={handleCustomDateChange}
            allowClear
            disabledDate={disabledDate}
            placeholder={["Start Date", "End Date"]}
            popupClassName="single-month-picker"
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="total-order">
        <Col span={24}>
          <div className="total-order-container">
            <span>Total Price: €{totalFilteredPrice.toFixed(2)}</span>
            <span>Page Total: €{calculateTotalPrice()}</span>
          </div>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        loading={loading}
        onChange={handlePageChange} // Handle page changes (page size, current page)
        pagination={{
          className: "table-pagination",
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: ["5", "8", "15", "20"], // Page size options
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} orders`,
        }}
      />
    </div>
  );
};

export default OrderReport;
