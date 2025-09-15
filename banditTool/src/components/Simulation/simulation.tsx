import {useState} from 'react';
import Configuration from './simInput/simConfig';
import './Simulation.css';

function simulation() {
    // state management
    const [drugs, setDrugs] = useState(4);
    const [patients, setPatients] = useState(40);

    // event handler
    const handleDrugsChange = (e) => {
        setDrugs(parseInt(e.target.value) || 0);
    }
    const handlePatientsChange = (e) => {
        setPatients(parseInt(e.target.value) || 0);
    }

    // const handlePlay = () => {
    //     // Hier können Sie die Simulationslogik implementieren
    //     console.log(`Starting simulation with ${drugs} drugs and ${patients} patients`);
    // };
    //
    // const handlePlot = () => {
    //     // Hier können Sie die Plot-Funktionalität implementieren
    //     console.log('Generating plot...');
    // };
    
    return (
        <>
            <h2>Simulation Tool</h2>
            <div className="simulation">
                <Configuration
                    drugs={drugs}
                    patients={patients}
                    handleDrugsChange={handleDrugsChange}
                    handlePatientsChange={handlePatientsChange}
                />

            </div>
        </>
    )
}

export default simulation;