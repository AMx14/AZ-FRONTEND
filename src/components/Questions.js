import React from 'react';

const Questions = ({ question }) => {
    if (!question || !question.qoptions) {
      return <div>No question available</div>;
    }
  
    return (
      <div>
        <h2>{question.qname}</h2>
        <ul>
          {question.qoptions.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Questions;
  