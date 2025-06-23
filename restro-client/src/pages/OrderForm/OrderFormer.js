import React, { useCallback, useEffect, useState } from "react";
import { Input, Button, Table, Col, Row, Switch } from "antd";
import CounterButton from "../../components/CounterButton";
import Modal from "../../components/Modal";
import ItemList from "../../components/Itemslist";
import {
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons"; // Icons for the toggle
import "./OrderForm.css";
import AddressForm from "../../components/AddressForm";
import ManualItemForm from "../../components/ManualItemForm";

export default function OrderForm({
  title,
  initialData = {},
  onSubmit,
  isSubmitting,
  formType,
  onStatusChange,
}) {
  const [tableNumber, setTableNumber] = useState(
    initialData?.tableNumber || ""
  );
  const [orderItems, setOrderItems] = useState(initialData?.orderItems || []);
  const [isManualItemModalOpen, setIsManualItemModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDate, setOrderDate] = useState(getTodayDate());
  const [pickupOrder, setPickupOrder] = useState(
    initialData?.pickupOrder || false
  );
  const [onlineOrder, setOnlineOrder] = useState(
    initialData?.onlineOrder || false
  );
  const [status] = useState("INPROGRESS");
  const [address, setAddress] = useState({
    postalCode: "",
    place: "",
    houseNumber: "",
    street: "",
    phoneNumebr: "",
  });

  const nextItemId = `I${(orderItems.length + 1).toString().padStart(3, "0")}`;

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setOrderDate(initialData.orderDate);
      setTableNumber(initialData.tableNumber);
      setOrderItems(initialData.orderItems);
      setPickupOrder(initialData.pickupOrder || false); // Set initial value for pickupOrder
      setOnlineOrder(initialData.onlineOrder || false); // Set initial value for onlineOrder
      setAddress(initialData.address);
    }
  }, [initialData]);

  const handleAddManualItem = (itemName, price) => {
    const newItem = {
      itemId: nextItemId,
      itemName: itemName,
      price: parseFloat(price),
      category: "Add-Ons", // Default category
      quantity: 1,
    };
    setOrderItems((prevItems) => [...prevItems, newItem]);
    setIsManualItemModalOpen(false); // Close modal
  };

  const handleAddItem = (item) => {
    setOrderItems((prev) =>
      prev.find((p) => p.itemName === item.itemName)
        ? prev
        : [...prev, { ...item, quantity: 1 }]
    );
  };

  const handleRemovePayload = (item) => {
    setOrderItems(orderItems.filter((i) => i.itemId !== item.itemId));
  };

  const handleQuantityChange = (record, quantity) => {
    if (quantity < 0) return; // Prevent negative quantities
    setOrderItems((prev) =>
      prev.map((item) =>
        item.itemId === record.itemId ? { ...item, quantity } : item
      )
    );
  };

  const handlePriceChange = (record, newPrice) => {
    const updatedItems = orderItems.map((item) =>
      item.itemId === record.itemId ? { ...item, price: newPrice } : item
    );
    setOrderItems(updatedItems);
  };

  const handleSubmit = () => {
  
    const payload = {
      tableNumber,
      orderDate,
      orderItems,
      status,
      pickupOrder,
      onlineOrder,
      address, // Include the address if onlineOrder is true
    };
    if (pickupOrder || onlineOrder) {
      delete payload.tableNumber; // Remove tableNumber if order is pickup or online
    }

    onSubmit(payload);
  };

  const handleAddressChange = useCallback((newAddress) => {
    setAddress(newAddress);
  }, []);

  const columns = [
    { title: "Item Id", dataIndex: "itemId" },
    { title: "Item Name", dataIndex: "itemName" },
    {
      title: "Quantity",
      render: (_, record) => (
        <CounterButton
          value={record.quantity}
          onIncrease={() => handleQuantityChange(record, record.quantity + 1)}
          onDecrease={() => handleQuantityChange(record, record.quantity - 1)}
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (_, record) => (
        <Input
          value={record.price}
          onChange={(e) => handlePriceChange(record, e.target.value)}
          style={{ width: 80 }}
          type="number"
        />
      ),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      render: (_, record) => (
        <span>{(record.quantity * record.price).toFixed(2)}</span> // Display total price based on qty * unitPrice
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Button
          danger
          onClick={() =>
            setOrderItems(orderItems.filter((i) => i.itemId !== record.itemId))
          }
          icon={<DeleteOutlined />}
        />
      ),
    },
  ];

  const generateTableGrid = () => {
    const tableNumbers = [];
    for (let i = 1; i <= 12; i++) {
      const isSelected = String(tableNumber) === String(i);
      tableNumbers.push(
        <Col span={6} key={i}>
          <Button
            className={`table-button ${isSelected ? "selected" : ""}`}
            onClick={() => setTableNumber(String(i))}
            disabled={pickupOrder && isSelected} // Disable only the currently selected table for pickup orders
          >
            {i}
          </Button>
        </Col>
      );
    }
    return tableNumbers;
  };

  // Handle Remove Table Number
  const handleRemoveTable = () => {
    setTableNumber(""); // Reset table number
  };

  const handleSwicthToggle = (payload, type) => {
    setPickupOrder((prevPickup) => (type === "pickup" ? payload : false));
  setOnlineOrder((prevOnline) => (type === "online" ? payload : false));

  if (type === "pickup" && payload) {
    setTableNumber(""); // Remove table number for pickup orders
  }
  if (type === "online" && payload) {
    setTableNumber(""); // Remove table number for online orders
  }
  };
  

  return (
    <div className="order-form-container">
      {/* Header */}
      <div className="order-form-header">
        <h2>{title}</h2>
      </div>
      <div className="pickup-order-toggle">
        <label className="pickup-order-label">Pickup Order</label>
        <Switch
          checked={pickupOrder}
          onChange={(checked) => handleSwicthToggle(checked, "pickup")}
          checkedChildren={<CheckOutlined />} // Added check icon when on
          unCheckedChildren={<CloseOutlined />} // Added close icon when off
          style={{
            width: 70, // Increased width of the switch
            height: 35, // Increased height of the switch
            borderRadius: 20,
            backgroundColor: pickupOrder ? "#52c41a" : "#f5222d", // Green for pickup, red for dine-in
            padding: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "18px", // Increased size of the text/icons
          }}
        />

        <label className="online-order-label">Online Order</label>
        <Switch
          checked={onlineOrder}
          onChange={(checked) => handleSwicthToggle(checked, "online")}
          checkedChildren={<CheckOutlined />} // Added check icon when on
          unCheckedChildren={<CloseOutlined />} // Added close icon when off
          style={{
            width: 70, // Increased width of the switch
            height: 35, // Increased height of the switch
            borderRadius: 20,
            backgroundColor: onlineOrder ? "#52c41a" : "#f5222d", // Green for pickup, red for dine-in
            padding: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "18px", // Increased size of the text/icons
          }}
        />
      </div>

      {/* Order Date */}
      <div className="order-date-container">
        <label className="order-date-label">Order Date:</label>
        <Input
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          type="date"
          className="order-date-input"
        />
      </div>
      {/* Main Section: Table Grid and Items Table */}

      {/* Action Buttons */}

      <div className="order-from-main-content">
        {onlineOrder && (
          <div className="address-form-container">
            <AddressForm
              initialData={address}
              onAddressChange={handleAddressChange}
            />
          </div>
        )}
        {/* Table Number Selection */}
        {!pickupOrder && !onlineOrder && (
          <div className="table-selection-container">
            <h4 className="table-selection-label">Select Table Number</h4>
            <Row gutter={[12, 12]}>{generateTableGrid()}</Row>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Table Number"
              className="table-number-input"
            />
            {/* Only show Cancel button if table is selected */}
            {tableNumber && (
              <Button
                type="default"
                danger
                onClick={handleRemoveTable}
                icon={<CloseOutlined />}
                style={{ marginTop: 10 }}
              >
                Cancel Table Selection
              </Button>
            )}
          </div>
        )}

        <div className="table-container">
          {/* Action Buttons (Positioned at Top-Right) */}
          <div className="action-buttons-container">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsManualItemModalOpen(true)}
            >
              Add Item Manually
            </Button>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Add Item
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>

          {/* Order Items Table */}
          <Table
            columns={columns}
            dataSource={orderItems}
            rowKey="itemId"
            scroll={{ x: "max-content" }}
            className="order-items-table"
          />
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <ItemList
            data={orderItems}
            handleAddToPayload={handleAddItem}
            handleRemoveFromPayload={handleRemovePayload}
          />
        </Modal>
      )}
      {isManualItemModalOpen && (
        <Modal onClose={() => setIsManualItemModalOpen(false)} size="medium">
          <ManualItemForm
            nextItemId={nextItemId}
            onAddItem={handleAddManualItem}
            onCancel={() => setIsManualItemModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

