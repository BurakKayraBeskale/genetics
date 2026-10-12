'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import './LabShell.css';
const links=[['/','Merkez'],['/dna','DNA Laboratuvarı'],['/simulation','Hastalık Simülatörü'],['/outbreak','Salgın Merkezi'],['/archive','Laboratuvar Arşivi'],['/catalog','Katalog']];
export default function LabShell({children}){const path=usePathname();return <div className="labApp"><header className="labAppNav"><Link className="labIdentity" href="/">◉ <span>GENETİK KEŞİF<small>SANAL BİYOMEDİKAL LABORATUVAR</small></span></Link><nav aria-label="Laboratuvar modülleri">{links.map(([url,name])=><Link key={url} href={url} aria-current={path===url?'page':undefined}>{name}</Link>)}</nav></header><div className="labModule">{children}</div></div>;}
