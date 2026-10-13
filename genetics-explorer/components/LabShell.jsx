'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import './LabShell.css';
import {useSimulation} from '../providers/SimulationProvider';
const links=[['/','Merkez'],['/dna?mode=free','DNA Laboratuvarı'],['/simulation','Hastalık Simülatörü'],['/outbreak','Salgın Merkezi'],['/archive','Laboratuvar Arşivi'],['/catalog','Katalog'],['/creator','Sanal Oluşturucu']];
export default function LabShell({children}){const path=usePathname();const {isMystery,studentView}=useSimulation();return <div className="labApp"><header className="labAppNav"><Link className="labIdentity" href="/">◉ <span>GENETİK KEŞİF<small>SANAL BİYOMEDİKAL LABORATUVAR</small></span></Link><nav aria-label="Laboratuvar modülleri">{links.filter(([url])=>!(isMystery&&studentView)||["/","/simulation","/outbreak"].includes(url)).map(([url,name])=><Link key={url} href={url} aria-current={path===url.split('?')[0]?'page':undefined}>{name}</Link>)}</nav></header><div className="labModule">{children}</div></div>;}
