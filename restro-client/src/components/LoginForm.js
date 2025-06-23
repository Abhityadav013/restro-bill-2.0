import React from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input,notification } from 'antd';
import axios from 'axios';
import { base_url } from '../utils/apiList';
import './LoginForm.css';

const LoginForm = ({ setModelOpen, setLogin }) => {
      const onFinish = async (values) => {
        try {
          const response = await axios.post(`${base_url}/auth/login`, values);
      
          if (response.status === 200 && response.data.token) {
            const jwtToken = response.data.token;
      
            // Save token to localStorage
            window.localStorage.setItem('access_token', jwtToken);
      
            // Decode JWT payload
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      
            // Update login state
            setLogin(true);
      
            // Close the modal
            setModelOpen(false);
      
            // Success notification
            notification.success({
              message: 'Login Successful',
              description: 'You have successfully logged in!',
            });
          }
        } catch (error) {
          // Handle login failure
          notification.error({
            message: 'Login Failed',
            description: error.response?.data?.message || 'Invalid username or password.',
          });
        }
      };
    
      return (
        <Form
          name="login"
          className='login-box'
          initialValues={{ remember: true }}
          style={{ maxWidth: 360}}
          onFinish={onFinish}
        >
          <h2 className="login-title">Welcome Back!</h2>
          <div className="center-container">
            
            <hr className="line" />
            <p className="center-text">Please log in to continue.</p>
            <hr className="line" />
          </div>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
            style={{color: '#888'}}
          >
            <Input prefix={<UserOutlined />} className='login-input-username' placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
          </Form.Item>
        </Form>
      );
}

export default LoginForm



