'use client';
import {useRouter} from 'next/navigation';
import LaboratoryArchive from '../../components/LaboratoryArchive';
import {useSimulation} from '../../providers/SimulationProvider';
export default function Page(){const lab=useSimulation();const router=useRouter();return <div className="routeArchive"><LaboratoryArchive cases={lab.cases} onResume={id=>{if(lab.loadCase(id))router.push('/simulation');}} onRestart={id=>{if(lab.restartCase(id))router.push('/simulation');}} onUpdate={lab.updateCase} onToggleStar={lab.starCase} onDelete={lab.deleteCase}/>{lab.error&&<p role="alert">{lab.error}</p>}</div>;}