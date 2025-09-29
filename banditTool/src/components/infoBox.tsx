import { Coffee, Target, Trophy, Zap } from 'lucide-react';
import './infoBox.css'

export function InfoBox() {
    return (
        <div className="card">
            <div className="card-content">
                <div className="info-header">
                    <h2 className="info-title">
                        <Coffee className="config-icon" />
                        Willkommen im interaktiven Coffeeshop!
                        <Coffee className="config-icon" />
                    </h2>
                </div>

                <div className="info-content">
                    <div className="info-paragraph">
                        <div className="info-emoji">🧠</div>
                        <p>
                            Stell dir vor, du bist ein Barista und hast gerade eine Lieferung mit brandneuen, unbekannten
                            Kaffeebohnen erhalten. Deine Aufgabe ist es, so schnell wie möglich die absolut leckerste
                            Bohne zu finden, um deine Kunden zu begeistern. Das Problem? Du hast nur eine begrenzte
                            Anzahl an Test-Tassen, die du brühen kannst.
                        </p>
                    </div>

                    <div className="info-paragraph">
                        <div className="info-emoji">🕹️</div>
                        <p>
                            Diese Webseite ist ein spielerischer Simulator, der dich vor ein klassisches Problem der
                            Informatik und Datenwissenschaft stellt: das "Multi-Armed Bandit"-Problem.
                        </p>
                    </div>

                    <div className="mission-box">
                        <h3 className="mission-title">
                            <Target className="config-icon" />
                            Deine Mission:
                        </h3>
                        <div className="mission-content">
                            <div className="mission-item">
                                <div className="info-emoji">🧪</div>
                                <div>
                                    <strong style={{ color: '#059669' }}>Teste die Bohnen:</strong> Klicke auf die verschiedenen
                                    Kaffee-Automaten, um eine Tasse zu "brühen" und das Geschmacksergebnis zu sehen.
                                </div>
                            </div>

                            <div className="mission-item">
                                <Trophy className="mission-icon trophy" />
                                <div>
                                    <strong style={{ color: '#059669' }}>Maximiere deinen Punktestand:</strong> Jede Tasse gibt
                                    dir – je nach Geschmack – eine bestimmte Anzahl an Punkten. Dein Ziel ist es, am Ende
                                    die höchstmögliche Gesamtpunktzahl zu erreichen.
                                </div>
                            </div>

                            <div className="mission-item">
                                <Zap className="mission-icon zap" />
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