import React, { useEffect, useState } from "react";
import { Input, List, Button, Row, Col, Select } from "antd";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import "./Itemslist.css";
import axiosInstance from "../utils/AxiosInstance";

const { Option } = Select;

const ItemList = ({ data, handleAddToPayload, handleRemoveFromPayload }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  // Fetch reservations data
  const fetchMenu = async () => {
    try {
      const response = await axiosInstance.get(`/menu`);
      setMenu(response.data);
      const uniqueCategories = [...new Set(response.data.map((item) => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching menu", error);
    }
  };

  useEffect(() => {
    fetchMenu(); // Fetch data when the component mounts
  }, []); // Empty dependency array means this runs only on component mount

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const filteredItems = menu.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="item-list-container">
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {/* Search Bar */}
        <Input
          className="search-bar"
          placeholder="Search by name"
          onChange={handleSearch}
          style={{ width: "300px" }}
        />

        {/* Category Dropdown */}
        <Select
          className="itemlist-category"
          placeholder="Filter by category"
          onChange={handleCategoryChange}
          allowClear
          style={{ width: "200px" }}
        >
          {categories.map((category) => (
            <Option key={category} value={category}>
              {category}
            </Option>
          ))}
        </Select>
      </div>

      {/* Item List */}
      <List
        bordered
        dataSource={filteredItems}
        renderItem={(item) => (
          <List.Item>
            <Row style={{ width: "100%" }}>
              <Col span={16}>
                <span className="item-name">{item.itemName}</span>
                <p style={{ margin: 0 }}>{item.category}</p>
                <p style={{ margin: 0, fontStyle: "italic" }}>{item.price}</p>
              </Col>
              <Col span={8} style={{ textAlign: "right" }}>
                {data.find((p) => p.itemName === item.itemName) ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleRemoveFromPayload(item)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="default"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddToPayload(item)}
                  >
                    Add
                  </Button>
                )}
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ItemList;
