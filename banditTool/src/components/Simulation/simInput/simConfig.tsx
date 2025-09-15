import './simConfig.css'; // CSS-Datei für die Configuration-Komponente

const Configuration = ({drugs, patients, handleDrugsChange, handlePatientsChange}) => {
    return (
        <div className="configuration">
            {/* Drugs Configuration */}
            <div>
                <label id="drugsLabel">Drugs</label>
                <div className="drugsInput">
                    <input
                        type="range"
                        id="drugsRange"
                        min="0"
                        max="50"
                        value={drugs}
                        onChange={handleDrugsChange}
                    />
                    <input
                        type="number"
                        id="drugsNumber"
                        min="0"
                        max="50"
                        value={drugs}
                        onChange={handleDrugsChange}
                    />
                </div>
            </div>

            {/* Patients Configuration */}
            <div>
                <label id="patientsLabel">Patients</label>
                <div className="patientsInput">
                    <input
                        type="range"
                        id="patientsRange"
                        min="0"
                        max="1000"
                        value={patients}
                        onChange={handlePatientsChange}
                    />
                    <input
                        type="number"
                        id="patientsNumber"
                        min="0"
                        max="1000"
                        value={patients}
                        onChange={handlePatientsChange}
                    />
                </div>
            </div>
            {/* Bandit Configuration */}
            <div>
                <label id="banditLabel">Bandit</label>
                <div className="banditInput">
                    <input
                        type="number"
                        id="bandit"

                    />
                </div>
            </div>
        </div>
    );
};

export default Configuration;