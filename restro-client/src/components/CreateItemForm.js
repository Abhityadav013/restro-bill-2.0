import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Select } from "antd";
import "./CreateItemForm.css";

const { Option } = Select;

const CreateItemForm = ({ initialValues, handleFormSubmit }) => {
  // Validation Schema using Yup
  const validationSchema = Yup.object({
    itemId: Yup.string()
      .required("Item ID is required"),
    itemName: Yup.string()
      .required("Item Name is required")
      .min(2, "Item Name must be at least 2 characters")
      .max(50, "Item Name cannot exceed 50 characters"),
    price: Yup.number()
      .required("Price is required")
      .max(10000, "Price cannot exceed 10,000"),
    category: Yup.string().required("Category is required"),
  });

  const onSubmit = (values) => {
    handleFormSubmit(values)
  };

  return (
    <div className="menu-item-form-container">
      <h1>Create New Menu Item</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          onSubmit(values); // Submit form values to parent component or backend
        }}
      >
        {({ setFieldValue, values }) => (
          <Form className="menu-item-form">
            {/* Item ID */}
            <div className="form-group">
              <label htmlFor="itemId">Item ID:</label>
              <Field
                type="text"
                id="itemId"
                name="itemId"
                className="form-input"
                placeholder="Enter item ID"
              />
              <ErrorMessage
                name="itemId"
                component="div"
                className="error-message"
              />
            </div>

            {/* Item Name */}
            <div className="form-group">
              <label htmlFor="itemName">Item Name:</label>
              <Field
                type="text"
                id="itemName"
                name="itemName"
                className="form-input"
                placeholder="Enter item name"
              />
              <ErrorMessage
                name="itemName"
                component="div"
                className="error-message"
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">Price (€):</label>
              <Field
                type="number"
                id="price"
                name="price"
                className="form-input"
                placeholder="Enter price"
              />
              <ErrorMessage
                name="price"
                component="div"
                className="error-message"
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <Select
                id="category"
                className="form-select"
                value={values.category}
                onChange={(value) => setFieldValue("category", value)}
                placeholder="Select a category"
              >
                <Option value="Suppen">Suppen</Option>
                <Option value="Indische Vorspeisen">Indische Vorspeisen</Option>
                <Option value="Salate">Salate</Option>
                <Option value="Tandoori Spezialitäten">Tandoori Spezialitäten</Option>
                <Option value="Indische Hähnchenspezialitäten">Indische Hähnchenspezialitäten</Option>
                <Option value="Fischspezialitäten">Fischspezialitäten</Option>
                <Option value="Lammspezialitäten">Lammspezialitäten</Option>
                <Option value="Biryani Basmati-Reis-Spezialitäten">Biryani Basmati-Reis-Spezialitäten</Option>
                <Option value="Indische Spezialitäten Vegetarisch">Indische Spezialitäten Vegetarisch</Option>
                <Option value="Kinder Menü">Kinder Menü</Option>
                <Option value="Dessert-Menü">Dessert-Menü</Option>
                <Option value="Aperitif">Aperitif</Option>
                <Option value="Alkoholfreie Getränke">Alkoholfreie Getränke</Option>
                <Option value="Biere">Biere</Option>
                <Option value="Indische Kaltgetränke">Indische Kaltgetränke</Option>
                <Option value="Spirituosen / Liköre">Spirituosen / Liköre</Option>
                <Option value="Whisky">Whisky</Option>
                <Option value="Warme Getränke">Warme Getränke</Option>
                <Option value="Weine">Weine</Option>
                <Option value="Mittagsmenü">Mittagsmenü</Option>
              </Select>
              <ErrorMessage
                name="category"
                component="div"
                className="error-message"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateItemForm;