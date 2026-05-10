const Toast = ({ message, type = 'success' }) => {
  return (
    <div class={`toast toast-${type}`}>
      {message}
    </div>
  );
};

export default Toast;
