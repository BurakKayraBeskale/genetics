'use client';
import {useRouter} from 'next/navigation';
import MedicalCatalog from '../../components/MedicalCatalog';
import {useSimulation} from '../../providers/SimulationProvider';
export default function Page(){const lab=useSimulation();const router=useRouter();return <div className="routeCatalog"><MedicalCatalog onSimulate={id=>{lab.start(id);lab.pause();router.push('/simulation');}}/></div>;}