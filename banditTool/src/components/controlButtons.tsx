import { Play, BarChart3 } from 'lucide-react';
import "./controlButtons.css";

//Schaltflächen zum Starten der Simulation und zum Graphen anzeigen

const ControlButtons = ({
                            onStartGame,
                            onShowPlot,
                            hasGameData
                        }) => {
    return (
        <div className="control-buttons-container">
            <button
                onClick={onStartGame}
                className="control-button">
                <Play size={20} />
                Spiel starten
            </button>

            <button
                onClick={onShowPlot}
                disabled={!hasGameData}
                className="control-button">
                <BarChart3 size={20} />
                Graphen anzeigen
            </button>
        </div>
    );
};

export default ControlButtons;