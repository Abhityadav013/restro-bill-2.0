import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Select } from 'antd';
import './BookingForm.css';

const { Option } = Select;

const BookingForm = ({ initialValues, handleFormSubit }) => {
  // Validation Schema using Yup
  const validationSchema = Yup.object({
    bookingDate: Yup.date().required('Booking date is required'),
    numberOfPeople: Yup.number()
      .required('Number of people is required')
      .moreThan(0, 'Please at least 1 person is required')
      .max(100, 'Maximum 100 people allowed')
      .integer('Number of people must be an integer')
      .positive('Number of people cannot be negative'),
    bookingTime: Yup.string()
      .required('Time is required')
      .matches(/^([0-9]{1,2}):([0-9]{2})$/, 'Time must be in HH:mm format'),
    contactNumber: Yup.string(),
  });

  // Form submission handler
  const onSubmit = (values) => {
    handleFormSubit(values)
  };

  // Update bookingTime when hour or minute changes
  const handleHourChange = (value, setFieldValue, values) => {
    setFieldValue('hour', value);
    // Combine hour and minute into bookingTime field
    if (value && values.minute) {
      setFieldValue('bookingTime', `${value}:${values.minute}`);
    }
  };

  const handleMinuteChange = (value, setFieldValue, values) => {
    setFieldValue('minute', value);
    // Combine hour and minute into bookingTime field
    if (values.hour && value) {
      setFieldValue('bookingTime', `${values.hour}:${value}`);
    }
  };

  // Update the bookingTime field when the form is submitted
  const handleBeforeSubmit = (values, setFieldValue) => {
    if (values.hour && values.minute) {
      setFieldValue('bookingTime', `${values.hour}:${values.minute}`);
    } else if (values.hour && !values.minute) {
      setFieldValue('bookingTime', `${values.hour}:00`);
    } else if (!values.hour && values.minute) {
      setFieldValue('bookingTime', `00:${values.minute}`);
    }
  };

  return (
    <div className="booking-form-container">
      <h1>Booking Form</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setFieldValue }) => {
          handleBeforeSubmit(values, setFieldValue);
          onSubmit(values);
        }}
      >
        {({ setFieldValue, values }) => (
          <Form className="booking-form">
            <div className="form-group">
              <label htmlFor="bookingDate">Booking Date:</label>
              <Field
                type="date"
                id="bookingDate"
                name="bookingDate"
                className="form-input"
              />
              <ErrorMessage name="bookingDate" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label htmlFor="name">Booking Name:</label>
              <Field
                type="text"
                id="bookingName"
                name="bookingName"
                className="form-input"
              />
              <ErrorMessage name="bookingName" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfPeople">Number of People:</label>
              <Field
                type="number"
                min={0}
                id="numberOfPeople"
                name="numberOfPeople"
                className="form-input"
              />
              <ErrorMessage name="numberOfPeople" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label htmlFor="bookingTime">Time:</label>
              <div className="time-selector">
                <Select
                  className="time-select"
                  value={values.hour}
                  onChange={(value) => handleHourChange(value, setFieldValue, values)}
                  placeholder="Hour"
                >
                  {[...Array(24).keys()].map((hour) => (
                    <Option key={hour} value={String(hour).padStart(2, '0')}>
                      {String(hour).padStart(2, '0')}
                    </Option>
                  ))}
                </Select>
                <span className="colon">:</span>
                <Select
                  className="time-select"
                  value={values.minute}
                  onChange={(value) => handleMinuteChange(value, setFieldValue, values)}
                  placeholder="Minute"
                >
                  {[...Array(60).keys()].map((minute) => (
                    <Option key={minute} value={String(minute).padStart(2, '0')}>
                      {String(minute).padStart(2, '0')}
                    </Option>
                  ))}
                </Select>
              </div>
              <ErrorMessage name="bookingTime" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Contact Number:</label>
              <Field
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                className="form-input"
                // placeholder="e.g. 1234567890"
              />
              <ErrorMessage name="phoneNumber" component="div" className="error-message" />
            </div>

            <button type="submit" className="submit-button">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BookingForm;
