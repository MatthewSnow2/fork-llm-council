import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Stage1.css';

export default function Stage1({ responses }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!responses || responses.length === 0) {
    return null;
  }

  return (
    <details className="stage stage1 collapsible">
      <summary className="stage-summary">
        <span className="stage-title">Stage 1: Individual Responses</span>
        <span className="stage-meta">({responses.length} models)</span>
      </summary>

      <div className="stage-content">
        <div className="tabs">
          {responses.map((resp, index) => (
            <button
              key={index}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {resp.model.split('/')[1] || resp.model}
            </button>
          ))}
        </div>

        <div className="tab-content">
          <div className="model-name">{responses[activeTab].model}</div>
          <div className="response-text markdown-content">
            <ReactMarkdown>{responses[activeTab].response}</ReactMarkdown>
          </div>
        </div>
      </div>
    </details>
  );
}
