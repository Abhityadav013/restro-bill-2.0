import React from 'react';
import './Modal.css'; // Importing the modal's CSS

const Modal = ({ children, onClose, size = 'medium', closable = true }) => {
  return (
    <div className="modal-overlay">
      <div className={`modal-content ${size}`} onClick={(e) => e.stopPropagation()}>
        {/* Conditionally render the close button */}
        {closable && (
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
