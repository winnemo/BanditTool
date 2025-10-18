import { Coffee, Target, Brain, TrendingUp } from 'lucide-react';
import './infoBox.css';

export function InfoBox() {
    return (
        <div className="card info-card">
            <div className="info-header-static">
                <div className="info-title">
                    <Coffee className="config-icon" />
                    Willkommen beim interaktiven Bandit-Simulator!
                    <Coffee className="config-icon" />
                </div>
            </div>

            <div className="info-content-static">
                <div className="info-content">
                    <div className="info-paragraph">
                        <p>
                            Lerne spielerisch, wie Algorithmen komplexe Entscheidungen unter Unsicherheit treffen. Diese
                            Webseite demonstriert das <strong>"Multi-Armed Bandit"-Problem</strong>, eine klassische Herausforderung der Informatik!
                        </p>
                    </div>

                    <div className="info-paragraph">
                        <h3>
                            <Brain style={{ width: '1.125rem', height: '1.125rem' }} />
                            Das Kernproblem: Exploration vs. Exploitation
                        </h3>
                        <p>
                            Stell dir vor, du musst die beste aus mehreren Optionen wählen, hast aber nur begrenzte Versuche.
                            Solltest du eine neue, unbekannte Option testen (<strong>Exploration</strong>), um vielleicht eine bessere zu
                            entdecken? Oder solltest du bei der Option bleiben, die bisher die besten Ergebnisse geliefert
                            hat (<strong>Exploitation</strong>), um deinen Gewinn zu maximieren? Das ist der zentrale Konflikt, den die
                            Algorithmen hier zu lösen versuchen.
                        </p>
                    </div>

                    <div className="info-paragraph">
                        <h3>
                            <Coffee style={{ width: '1.125rem', height: '1.125rem' }} />
                            Unser Szenario: Der Coffeeshop
                        </h3>
                        <p>
                            Um das Problem greifbar zu machen: Du bist ein Barista mit mehreren
                            neuen, unbekannten Kaffeesorten. Dein Ziel ist es, die
                            beste Bohne zu finden und damit die höchste Punktzahl zu erreichen, bevor dir die Test-Tassen
                            ausgehen.
                        </p>
                    </div>

                    <div className="info-paragraph">
                        <h3>
                            <TrendingUp style={{ width: '1.125rem', height: '1.125rem' }} />
                            Wähle deinen Simulations-Modus
                        </h3>
                        <p>
                            Das Feedback deiner "Kunden" kann auf zwei verschiedene Weisen simuliert werden:
                        </p>
                        <div className="info-modes-list">
                            <div className="info-mode-item">
                                <p>
                                    <strong>Bernoulli-Modus (Ja / Nein):</strong> Ein Kunde liebt den Kaffee oder eben nicht.
                                    Erfolg (1 Punkt) oder Misserfolg (0 Punkte) – ideal für Klickraten oder binäre Reaktionen.
                                </p>
                            </div>
                            <div className="info-mode-item">
                                <p>
                                    <strong>Gauß-Modus (Bewertungsskala):</strong> Detailliertes Feedback mit Bewertungen auf
                                    einer Skala (1 bis 10 Punkte). Simuliert realistische Szenarien wie Produktbewertungen.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mission-box">
                        <h3 className="mission-title">
                            <Target className="config-icon" />
                            Deine Mission:
                        </h3>
                        <div className="mission-content">
                            <div className="mission-item">
                                <div>
                                    <strong style={{ color: '#059669' }}>Erkunde die Optionen (Exploration):</strong> Klicke auf
                                    die verschiedenen Kaffee-Automaten, um erste Daten zu sammeln. Jede Tasse kostet dich einen
                                    Versuch, gibt dir aber wertvolle Informationen.
                                </div>
                            </div>

                            <div className="mission-item">
                                <div>
                                    <strong style={{ color: '#059669' }}>Optimiere deinen Ertrag (Exploitation):</strong> Sobald
                                    du eine Ahnung hast, welche Bohnen gut sind, konzentriere dich auf sie, um deine
                                    Gesamtpunktzahl zu maximieren.
                                </div>
                            </div>

                            <div className="mission-item">
                                <div>
                                    <strong style={{ color: '#059669' }}>Vergleiche und schlage die Algorithmen:</strong> Während
                                    du spielst, siehst du live, wie verschiedene Algorithmen (z.B. Epsilon-Greedy, UCB) ihre
                                    Entscheidungen treffen. Beobachte ihre Strategie: Wann erkunden sie? Wann optimieren sie?
                                    Kannst du ihre Taktik durchschauen und eine bessere entwickeln?
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
