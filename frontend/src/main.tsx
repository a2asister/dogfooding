import { component$ } from '@builder.io/qwik';
import { render } from '@builder.io/qwik';
import { WallpaperApp } from './components/WallpaperApp';
import './global.css';

export const App = component$(() => {
  return <WallpaperApp />;
});

render(document.getElementById('root')!, <App />);