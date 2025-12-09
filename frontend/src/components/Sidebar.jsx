import { useState } from 'react';
import './Sidebar.css';

// Mode icons and descriptions
const MODE_DETAILS = {
  standard: { icon: '⚖️', label: 'Standard' },
  research: { icon: '🔬', label: 'Research' },
  creative: { icon: '🎨', label: 'Creative' },
};

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  modes,
  selectedMode,
  onModeChange,
}) {
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>LLM Council</h1>

        {/* Mode Selector */}
        <div className="mode-selector">
          <button
            className="mode-selector-btn"
            onClick={() => setShowModeDropdown(!showModeDropdown)}
          >
            <span className="mode-icon">
              {MODE_DETAILS[selectedMode]?.icon || '⚖️'}
            </span>
            <span className="mode-label">
              {MODE_DETAILS[selectedMode]?.label || 'Standard'}
            </span>
            <span className="mode-arrow">{showModeDropdown ? '▲' : '▼'}</span>
          </button>

          {showModeDropdown && (
            <div className="mode-dropdown">
              {modes.map((mode) => (
                <div
                  key={mode.id}
                  className={`mode-option ${
                    mode.id === selectedMode ? 'selected' : ''
                  }`}
                  onClick={() => {
                    onModeChange(mode.id);
                    setShowModeDropdown(false);
                  }}
                >
                  <span className="mode-option-icon">{mode.icon}</span>
                  <div className="mode-option-content">
                    <div className="mode-option-name">{mode.name}</div>
                    <div className="mode-option-desc">{mode.description}</div>
                  </div>
                  {mode.id === selectedMode && (
                    <span className="mode-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="new-conversation-btn" onClick={onNewConversation}>
          + New Conversation
        </button>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                conv.id === currentConversationId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conversation-title">
                <span className="conv-mode-icon">
                  {MODE_DETAILS[conv.mode]?.icon || '⚖️'}
                </span>
                {conv.title || 'New Conversation'}
              </div>
              <div className="conversation-meta">
                {conv.message_count} messages
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
