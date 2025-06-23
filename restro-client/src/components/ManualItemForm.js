import React, { useState } from "react";
import { Input, Button, Form, message } from "antd";
import './ManualItemForm.css'; // Importing the custom CSS for styling

const ManualItemForm = ({ nextItemId, onAddItem, onCancel }) => {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [isPriceValid, setIsPriceValid] = useState(true); // State to manage price validation

  const handleSubmit = () => {
    if (!itemName || !price) {
      message.error("Please provide both item name and price.");
      return;
    }

    if (isNaN(price) || price <= 0) {
      setIsPriceValid(false);
      message.error("Price must be a valid number greater than 0.");
      return;
    }

    if(typeof(itemName) !== 'string'){
        message.error("Item Name must be Letter not number.");
        return;
    }

    onAddItem(itemName, price);
    setItemName("");
    setPrice("");
    setIsPriceValid(true); // Reset price validation
  };

  return (
    <div className="manual-item-form-container">
      <Form>
        <div className="form-group">
          <label className="form-label">Item ID: {nextItemId}</label>
        </div>
        <div className="form-group">
          <label className="form-label">Item Name:</label>
          <Input
            className="form-input"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Price:</label>
          <Input
            className={`form-input ${isPriceValid ? "" : "input-error"}`}
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setIsPriceValid(true); // Reset price validation on each input
            }}
            placeholder="Enter price"
          />
          {!isPriceValid && <div className="error-message">Price must be a valid number greater than 0</div>}
        </div>
        <div className="form-actions">
          <Button className="cancel-button" onClick={onCancel}>Cancel</Button>
          <Button className="submit-manual-item-button" type="primary" onClick={handleSubmit}>Add Item</Button>
        </div>
      </Form>
    </div>
  );
};

export default ManualItemForm;
