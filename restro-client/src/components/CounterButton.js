import React from 'react';
import './CounterButton.css';  // Import the CSS file for styling

const CounterButton = ({ value, onIncrease, onDecrease }) => {
  return (
    <div className="counter-btn-container">
      <button onClick={onDecrease}>-</button>
      <span>{value}</span>
      <button onClick={onIncrease}>+</button>
    </div>
  );
};

export default CounterButton;