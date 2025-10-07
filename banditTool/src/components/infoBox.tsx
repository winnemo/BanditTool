// Importiert verschiedene Icons aus der lucide-react Bibliothek zur visuellen Untermalung.
import { Coffee, Target} from 'lucide-react';
// Importiert das zugehörige Stylesheet für die Komponente.
import './infoBox.css'

/**
 * Eine statische React-Komponente, die als Willkommens- und Informationsbox dient.
 * Sie erklärt dem Benutzer das Szenario und die Ziele des Spiels.
 *
 * @returns {JSX.Element} Die gerenderte InfoBox-Komponente.
 */
export function InfoBox() {
    return (
        <div className="card">
            <div className="card-content">
                {/* Header-Bereich der Info-Box */}
                <div className="info-header">
                    <h2 className="info-title">
                        <Coffee className="config-icon" />
                        Willkommen im interaktiven Coffeeshop!
                        <Coffee className="config-icon" />
                    </h2>
                </div>

                <div className="info-content">
                    {/* Erster Absatz: Die narrative Einleitung in die Story. */}
                    <div className="info-paragraph">
                        <p>
                            Stell dir vor, du bist ein Barista und hast gerade eine Lieferung mit brandneuen, unbekannten
                            Kaffeebohnen erhalten. Deine Aufgabe ist es, so schnell wie möglich die absolut leckerste
                            Bohne zu finden, um deine Kunden zu begeistern. Das Problem? Du hast nur eine begrenzte
                            Anzahl an Test-Tassen, die du brühen kannst.
                        </p>
                    </div>

                    {/* Zweiter Absatz: Die Erklärung des technischen Hintergrunds (Multi-Armed Bandit). */}
                    <div className="info-paragraph">
                        <p>
                            Diese Webseite ist ein spielerischer Simulator, der dich vor ein klassisches Problem der
                            Informatik und Datenwissenschaft stellt: das "Multi-Armed Bandit"-Problem.
                        </p>
                    </div>

                    {/* Eine separate, hervorgehobene Box, die die Mission des Spielers definiert. */}
                    <div className="mission-box">
                        <h3 className="mission-title">
                            <Target className="config-icon" />
                            Deine Mission:
                        </h3>
                        <div className="mission-content">
                            {/* Missionsziel 1: Testen der Bohnen */}
                            <div className="mission-item">
                                <div>
                                    <strong style={{ color: '#059669' }}>Teste die Bohnen:</strong> Klicke auf die verschiedenen
                                    Kaffee-Automaten, um eine Tasse zu "brühen" und das Geschmacksergebnis zu sehen.
                                </div>
                            </div>

                            {/* Missionsziel 2: Maximieren der Punkte */}
                            <div className="mission-item">
                                <div>
                                    <strong style={{ color: '#059669' }}>Maximiere deinen Punktestand:</strong> Jede Tasse gibt
                                    dir – je nach Geschmack – eine bestimmte Anzahl an Punkten. Dein Ziel ist es, am Ende
                                    die höchstmögliche Gesamtpunktzahl zu erreichen.
                                </div>
                            </div>

                            {/* Missionsziel 3: Besser sein als die Algorithmen */}
                            <div className="mission-item">
                                <div>
                                    <strong style={{ color: '#059669' }}>Schlage die Algorithmen:</strong> Während du testest,
                                    treten Algorithmen gegen dich an. Beobachte live, für welche Bohnen sie sich entscheiden
                                    und ob du eine bessere Strategie als sie entwickeln kannst!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}