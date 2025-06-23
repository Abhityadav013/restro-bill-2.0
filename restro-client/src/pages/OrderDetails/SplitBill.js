import React, { useEffect, useState, useCallback } from "react";
import { Input, Button, Table, List } from "antd";
import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/apiList";

const SplitBillApp = ({ orderItems, order }) => {
  const [numPeople, setNumPeople] = useState(0);
  const [peopleData, setPeopleData] = useState([]); // Array of person data
  const [remainingItems, setRemainingItems] = useState([...orderItems]); // Tracks remaining quantities
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Initialize people containers
  const initializePeople = () => {
    const initialData = Array.from({ length: numPeople }, () => ({ items: [] }));
    setPeopleData(initialData);
  };

  // Memoize the search function to prevent unnecessary re-creations
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = remainingItems.filter(
      (item) =>
        item.itemId.includes(query) ||
        item.itemName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  }, [remainingItems]);

  // Handle add item to person's state
  const handleAddItem = (personIndex, item) => {
    if (!item || item.quantity <= 0) {
      alert("Item is out of stock or unavailable.");
      return;
    }

    // Update the person's items
    const updatedPeopleData = [...peopleData];
    const existingItem = updatedPeopleData[personIndex].items.find((i) => i.itemId === item.itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedPeopleData[personIndex].items.push({
        itemId: item.itemId,
        itemName: item.itemName,
        price: item.price,
        quantity: 1,
        category:item.category
      });
    }
    setPeopleData(updatedPeopleData);

    // Update remaining items
    const updatedRemainingItems = remainingItems.map((i) =>
      i.itemId === item.itemId ? { ...i, quantity: i.quantity - 1 } : i
    );
    setRemainingItems(updatedRemainingItems); // Updates remaining items and triggers useEffect
  };

  const handleQuantityChange = (personIndex, itemId, newQuantity) => {
    const updatedPeopleData = [...peopleData];
    const personItems = updatedPeopleData[personIndex].items;
    const item = personItems.find((i) => i.itemId === itemId);

    if (item && newQuantity >= 0 && newQuantity <= remainingItems.find((i) => i.itemId === itemId).quantity + item.quantity) {
      const quantityDifference = newQuantity - item.quantity;
      item.quantity = newQuantity;
      setPeopleData(updatedPeopleData);

      // Update remaining items
      const updatedRemainingItems = remainingItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity - quantityDifference } : i
      );
      setRemainingItems(updatedRemainingItems);
    }
  };

  // Re-filter search results whenever remainingItems changes
  useEffect(() => {
    handleSearch(searchQuery); // Re-trigger search whenever remainingItems is updated
  }, [remainingItems, searchQuery, handleSearch]);

  const columns = [
    { title: "Item Id", dataIndex: "itemId" },
    { title: "Item Name", dataIndex: "itemName" },
    {
      title: "Quantity",
      render: (_, record, index) => (
        <Input
          type="number"
          min={0}
          max={remainingItems.find((i) => i.itemId === record.itemId).quantity + record.quantity}
          value={record.quantity}
          onChange={(e) => handleQuantityChange(index, record.itemId, parseInt(e.target.value, 10))}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "Actions",
      render: (_, record, personIndex) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(personIndex, record.itemId)}
        />
      ),
    },
  ];

  const handleRemoveItem = (personIndex, itemId) => {
    const updatedPeopleData = [...peopleData];
    const personItems = updatedPeopleData[personIndex].items;
    const itemIndex = personItems.findIndex((i) => i.itemId === itemId);
    if (itemIndex > -1) {
      const removedItem = personItems[itemIndex];
      personItems.splice(itemIndex, 1);
      setPeopleData(updatedPeopleData);

      // Restore quantity to remaining items
      const updatedRemainingItems = remainingItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity + removedItem.quantity } : i
      );
      setRemainingItems(updatedRemainingItems);
    }
  };

  // const addCategoryToPersonItems = (personItems, orderItems) => {
  //   // Iterate through personItems and match itemId with orderItems
  //   return personItems.map(personItem => {
  //     const matchedItem = orderItems.find(orderItem => orderItem.itemId === personItem.itemId);
  //     if (matchedItem) {
  //       // If a match is found, add the category to the personItem
  //       return {
  //         ...personItem,    // Copy all properties from the original item
  //         category: matchedItem.category,  // Add the category from orderItems
  //       };
  //     }
  //     // If no match is found, return the original personItem (no category added)
  //     return personItem;
  //   });
  // };

  const generateBillForPerson = async (orderId, personIndex, personItems, orderItems) => {
    // Function to add category to person items based on itemId
    const addCategoryToPersonItems = (personItem, orderItems) => {
      // Find the matching order item based on itemId
      const matchedItem = orderItems.find((orderItem) => orderItem.itemId === personItem.itemId);
      if (matchedItem) {
        return { ...personItem, category: matchedItem.category }; // Add the category if a match is found
      }
      return personItem; // Return the original item if no match is found
    };
  
    // Add category to each item in personItems
    const itemsWithCategory = personItems.map((item) =>
      addCategoryToPersonItems(item, orderItems)  // Ensure category is added for each item
    );
  
    try {
      // Use the updated itemsWithCategory (with category included) for the API request
      const response = await axios.post(base_url + `/generate-bill-for-person`, {
        orderId, 
        personIndex,
        personItems: itemsWithCategory // Pass the updated items with categories
      }, { responseType: 'blob' });
  
      // Handle file download (the generated PDF)
      const blob = response.data;  // The blob containing the generated PDF
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `bill_person_${personIndex + 1}.pdf`; // Set the file name
      link.click(); // Trigger the download
    } catch (error) {
      console.error("Error generating bill:", error);
      alert("Failed to generate the bill. Please try again later.");
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h1>Split Bill App</h1>
      <Input
        type="number"
        placeholder="Enter number of people"
        onChange={(e) => setNumPeople(Number(e.target.value))}
        style={{ width: "200px", marginBottom: "20px" }}
      />
      <Button type="primary" onClick={initializePeople}>
        Split Bill
      </Button>

      {peopleData.map((person, index) => (
        <div key={index} style={{ margin: "20px 0" }}>
          <h3>Person {index + 1}</h3>
          <Input
            placeholder="Search by item ID or name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "300px", marginBottom: "10px" }}
          />
          {searchQuery && (
            <List
              bordered
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  actions={[<Button onClick={() => handleAddItem(index, item)}>Add</Button>]}
                >
                  {item.itemName} (ID: {item.itemId}) - €{item.price} ({item.quantity} left)
                </List.Item>
              )}
              style={{ marginBottom: "20px" }}
            />
          )}
          <Table
            columns={columns.map((col) =>
              col.render && col.title === "Quantity"
                ? { ...col, render: (_, record) => col.render(_, record, index) }
                : col
            )}
            dataSource={person.items}
            rowKey="itemId"
            pagination={false}
          />
          <Button
            icon={<PrinterOutlined />}
            type="primary"
            onClick={() => generateBillForPerson(order.orderId,index,person.items,orderItems)}
            style={{ marginTop: "20px" }}
          >
            Print Bill
          </Button>
          <h4>
            Total: €{person.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
          </h4>
        </div>
      ))}
    </div>
  );
};

export default SplitBillApp;
