import ReactMarkdown from 'react-markdown';
import './ResearchStage.css';

export default function ResearchStage({ research }) {
  if (!research || !research.content) {
    return null;
  }

  return (
    <details className="stage research-stage collapsible">
      <summary className="stage-summary">
        <span className="stage-icon">🔬</span>
        <span className="stage-title">Deep Research</span>
        <span className="stage-meta">({research.model?.split('/')[1] || research.model})</span>
      </summary>

      <div className="stage-content">
        <div className="research-model">
          Research conducted by: {research.model}
        </div>
        <div className="research-content markdown-content">
          <ReactMarkdown>{research.content}</ReactMarkdown>
        </div>
      </div>
    </details>
  );
}
