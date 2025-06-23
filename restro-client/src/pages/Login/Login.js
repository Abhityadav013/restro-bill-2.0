import React, { useState } from 'react'
import Modal from '../../components/Modal'
import LoginForm from '../../components/LoginForm'

const Login = ({isModelOpen,setModelOpen, setLogin}) => {
    //const [isModelOpen,setModelOpen]= useState(isLogin)
    console.log("aaaaa",isModelOpen)
    const handleClose = () => {
      setModelOpen(false); // Only update state via an event or handler
    };
  return (<> 
  {isModelOpen && (
    <Modal onClose={handleClose} // Prevent modal from closing unless explicitly handled
          size="small"
          visible={isModelOpen} // Ensures modal visibility
          footer={null} // Removes default footer
          closable={false} // Disables the close (X) button
          maskClosable={false} // Prevents closing by clicking outside
          centered // Centers the modal
  ><LoginForm setModelOpen={setModelOpen} setLogin={setLogin}></LoginForm>
  </Modal>)}</>
   )
}

export default Login