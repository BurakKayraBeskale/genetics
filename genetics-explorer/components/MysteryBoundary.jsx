'use client';
import {useSimulation} from '../providers/SimulationProvider';
export default function MysteryBoundary({children}){const {isMystery,studentView,setStudentView}=useSimulation();if(isMystery&&studentView)return <main className="controlCenter"><h1>Gizemli vaka sürüyor</h1><p>Öğrenci görünümünde profil ve öğretmen yapılandırması gizlidir. Bulguları Simülatör ve Salgın Merkezi'nde inceleyebilirsin.</p><button onClick={()=>setStudentView(false)}>Öğretmen görünümüne geç</button><p>Bu görünüm ayrımıdır; kimlik doğrulamalı sınav güvenliği sağlamaz.</p></main>;return children;}
