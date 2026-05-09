const AlertModal = ({ alert, onClose }) => {
  if (!alert) return null;

  const getAlertIcon = (level) => {
    switch (level) {
      case 'red': return '🔴';
      case 'orange': return '🟠';
      case 'yellow': return '🟡';
      case 'blue': return '🔵';
      default: return '⚠️';
    }
  };

  return (
    <div className="alert-modal" onClick={onClose}>
      <div className="alert-content" onClick={e => e.stopPropagation()}>
        <div className="alert-icon">{getAlertIcon(alert.level)}</div>
        <div className="alert-title">{alert.type}</div>
        <div className="alert-desc">{alert.description}</div>
        <div className="alert-time">{alert.time}</div>
        <button className="alert-btn" onClick={onClose}>
          我知道了
        </button>
      </div>
    </div>
  );
};

export default AlertModal;