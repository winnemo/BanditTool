import React from 'react';
import { Play, BarChart3 } from 'lucide-react';
import "./controlButtons.css";

const ControlButtons = ({
                            onStartGame,
                            onShowPlot,
                            hasGameData
                        }) => {
    return (
        <div className="">
            <button
                onClick={onStartGame}
                className=""
            >
                <Play className="" size={20} />
                Spiel starten
            </button>

            <button
                onClick={onShowPlot}
                disabled={!hasGameData}
                className=""
            >
                <BarChart3 className="" size={20} />
                Graphen anzeigen
            </button>
        </div>
    );
};

export default ControlButtons;