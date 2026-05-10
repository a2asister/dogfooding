import { createSignal, createEffect, onCleanup } from 'solid-js';
import CountdownDigit from './CountdownDigit';

export default function CountdownTimer(props) {
  const [timeLeft, setTimeLeft] = createSignal(props.timeRemaining || 0);
  let interval = null;
  
  createEffect(() => {
    setTimeLeft(props.timeRemaining || 0);
  });
  
  createEffect(() => {
    if (interval) clearInterval(interval);
    
    interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    
    onCleanup(() => {
      if (interval) clearInterval(interval);
    });
  });
  
  const hours = () => Math.floor(timeLeft() / (1000 * 60 * 60));
  const minutes = () => Math.floor((timeLeft() % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = () => Math.floor((timeLeft() % (1000 * 60)) / 1000);
  
  const formatNumber = (num) => {
    const str = num.toString().padStart(2, '0');
    return [parseInt(str[0]), parseInt(str[1])];
  };
  
  const Separator = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 10px'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        background: '#00f7ff',
        borderRadius: '50%',
        boxShadow: '0 0 20px #00f7ff, 0 0 40px #0066ff',
        margin: '8px 0'
      }} />
      <div style={{
        width: '12px',
        height: '12px',
        background: '#00f7ff',
        borderRadius: '50%',
        boxShadow: '0 0 20px #00f7ff, 0 0 40px #0066ff',
        margin: '8px 0'
      }} />
    </div>
  );
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <CountdownDigit value={formatNumber(hours())[0]} />
        <CountdownDigit value={formatNumber(hours())[1]} />
      </div>
      
      <Separator />
      
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <CountdownDigit value={formatNumber(minutes())[0]} />
        <CountdownDigit value={formatNumber(minutes())[1]} />
      </div>
      
      <Separator />
      
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <CountdownDigit value={formatNumber(seconds())[0]} />
        <CountdownDigit value={formatNumber(seconds())[1]} />
      </div>
    </div>
  );
}
