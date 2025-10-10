import banditLogo from '../assets/banditLogo.png'; // Passe den Pfad ggf. an
import './Header.css';

export function Header() {
    return (
        <header className="header">
            <div className="header-logo">
                <img src={banditLogo} alt="Bandit Coffee Logo" />
            </div>
            <div className="header-title">
                <h1>Bandit Coffeeshop</h1>
            </div>
        </header>
    );
}