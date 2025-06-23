// import React, { useEffect } from "react";
// import { Formik, Field, Form, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import { Button } from "antd"; // Using Ant Design for the Add More button
// import "./MenuItem.css";

// // Validation Schema using Yup
// const validationSchema = Yup.object({
//   itemId: Yup.string().required("Item Id is required"),
//   itemName: Yup.string().required("Item Name is required"),
//   price: Yup.number()
//     .required("Price is required")
//     .positive("Price must be greater than 0")
//     .min(0.1, "Price should be greater than 0"),
//   category: Yup.string().required("Category is required"),
// });

// const MenuItemForm = ({ initialValues, handleFormSubmit }) => {
//   // Ensuring initial values are defined
//   const defaultInitialValues = {
//     itemId: initialValues.itemId || "",
//     itemName: initialValues.itemName || "",
//     price: initialValues.price || "",
//     category: initialValues.category || "",
//   };

//   // useEffect to debug initial values
//   useEffect(() => {
//     console.log("Initial Values in Form", initialValues); // Debugging initial values
//   }, [initialValues]);



//   return (
//     <div className="menu-item-form-container">
//       <h1>Menu Item Form</h1>
//       <Formik
//         initialValues={defaultInitialValues} // Use default initial values with empty strings
//         validationSchema={validationSchema}
//         onSubmit={() => alert('hello')} // Handle form submission
//         enableReinitialize
//       >
//         {({ values, isSubmitting }) => (
//           <Form className="menu-form">
//             {/* Single Item Form Fields */}
//             <div className="form-group">
//               <label htmlFor="itemId">Item ID:</label>
//               <Field
//                 type="text"
//                 id="itemId"
//                 name="itemId"
//                 className="form-input"
//               />
//               <ErrorMessage
//                 name="itemId"
//                 component="div"
//                 className="error-message"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="itemName">Item Name:</label>
//               <Field
//                 type="text"
//                 id="itemName"
//                 name="itemName"
//                 className="form-input"
//               />
//               <ErrorMessage
//                 name="itemName"
//                 component="div"
//                 className="error-message"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="price">Price:</label>
//               <Field
//                 type="number"
//                 id="price"
//                 name="price"
//                 className="form-input"
//               />
//               <ErrorMessage
//                 name="price"
//                 component="div"
//                 className="error-message"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="category">Category:</label>
//               <Field
//                 type="text"
//                 id="category"
//                 name="category"
//                 className="form-input"
//               />
//               <ErrorMessage
//                 name="category"
//                 component="div"
//                 className="error-message"
//               />
//             </div>

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               className="submit-button"
//               disabled={isSubmitting} // Disable submit button while form is submitting
//             >
//               Submit Item
//             </Button>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default MenuItemForm;
