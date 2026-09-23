import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES } from '../data/pythonProjectFiles';

export async function downloadProjectAsZip() {
  const zip = new JSZip();

  // Root project folder inside zip
  const projectFolder = zip.folder('ai_smart_waste_management');
  if (!projectFolder) return;

  // Add all main python code files and documentation
  PYTHON_PROJECT_FILES.forEach((file) => {
    projectFolder.file(file.name, file.code || file.content || '');
  });

  // Add dummy placeholder folders and sample data
  const dataFolder = projectFolder.folder('data');
  if (dataFolder) {
    dataFolder.file(
      'sample_sensor_logs.csv',
      'bin_id,timestamp,fill_level,temperature,gas_ppm,battery,status\n' +
        'BIN-101,2025-05-10 08:00:00,35,21.4,120,98,NORMAL\n' +
        'BIN-101,2025-05-10 09:00:00,42,22.1,135,97,NORMAL\n' +
        'BIN-101,2025-05-10 10:00:00,58,23.5,150,96,NORMAL\n' +
        'BIN-101,2025-05-10 11:00:00,74,24.8,190,95,NORMAL\n' +
        'BIN-101,2025-05-10 12:00:00,86,26.0,240,94,CRITICAL\n'
    );
  }

  const scriptsFolder = projectFolder.folder('scripts');
  if (scriptsFolder) {
    scriptsFolder.file(
      'run_all.sh',
      '#!/bin/bash\n' +
        'echo "Starting AI-Powered Smart Waste Management System..."\n' +
        'python -m venv venv\n' +
        'source venv/bin/activate\n' +
        'pip install -r requirements.txt\n' +
        'python -c "import database; database.init_db()"\n' +
        'python sensor_simulator.py & \n' +
        'streamlit run app.py\n'
    );
    scriptsFolder.file(
      'run_all.bat',
      '@echo off\n' +
        'echo Starting AI-Powered Smart Waste Management System on Windows...\n' +
        'python -m venv venv\n' +
        'call venv\\Scripts\\activate\n' +
        'pip install -r requirements.txt\n' +
        'python -c "import database; database.init_db()"\n' +
        'start python sensor_simulator.py\n' +
        'streamlit run app.py\n' +
        'pause\n'
    );
  }

  // Generate binary zip
  const blob = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ai_smart_waste_management_final_year_project.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
