import './globals.css';
import SimulationProvider from '../providers/SimulationProvider';
import DNAWorkspaceProvider from '../providers/DNAWorkspaceProvider';
import LabShell from '../components/LabShell';

export const metadata = {
  title: 'Genetik Keşif — Sanal Biyomedikal Laboratuvar',
  description: 'DNA yapısını, gen bölgelerini, mutasyonları ve DNA → mRNA → protein akışını etkileşimli 3B model üzerinde öğreten holografik genetik laboratuvarı.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body><SimulationProvider><DNAWorkspaceProvider><LabShell>{children}</LabShell></DNAWorkspaceProvider></SimulationProvider></body>
    </html>
  );
}
