import styles from './components/Button.module.css';

const root = document.getElementById('root');

const button = document.createElement('button');
button.id = 'button';
button.className = `flex ${styles.button}`;
button.textContent = 'CSS Modules button';

root.appendChild(button);
