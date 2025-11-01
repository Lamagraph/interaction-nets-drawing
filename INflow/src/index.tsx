import { createRoot } from 'react-dom/client';
import App from '@/App';

import '@/assets/index.css';

const container = document.querySelector('#app');
if (!container) throw new Error('Container #app not found');

const root = createRoot(container);

root.render(<App />);
