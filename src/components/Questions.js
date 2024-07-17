// Questions.js
import React from 'react';

const Questions = ({ question }) => {
  return (
    <div className="question">
      <h2>{question.question}</h2>
      <ul>
        {question.options.map((option, index) => (
          <li key={index}>
            <label>
              <input type="radio" name="option" value={option} />
              {option}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Questions;
