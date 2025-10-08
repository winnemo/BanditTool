// Importiert das Logo-Bild aus dem 'assets'-Verzeichnis.
// Webpack/Vite wird diesen Import in einen gültigen Pfad oder eine Daten-URL umwandeln.
import banditLogo from '../assets/banditLogo.png';
// Importiert die spezifischen CSS-Stile für diese Komponente.
import './header.css'

/**
 * Eine statische React-Komponente, die die Kopfzeile der Anwendung rendert.
 * Sie enthält das Logo und den Titel der Webseite.
 *
 * @returns {JSX.Element} Die gerenderte Header-Komponente.
 */
export function Header() {
    return (
        // Semantisches <header>-Element als Hauptcontainer für die Kopfzeile.
        <header className="header">

            {/* Bereich für das Logo */}
            <div className="header-logo">
                <img
                    src={banditLogo} // Die Quelle des Bildes ist die importierte Logo-Variable.
                    alt="Bandit Coffee Logo" // Alternativtext für Barrierefreiheit.
                />
            </div>

            {/* Bereich für den Titel */}
            <div className="header-title">
                <h1>
                    Bandit Coffeeshop
                </h1>
            </div>

        </header>
    );
}