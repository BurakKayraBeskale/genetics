import './globals.css';

export const metadata = {
  title: 'Genetik Keşif — Etkileşimli 3B DNA Laboratuvarı',
  description: 'DNA yapısını, gen bölgelerini, mutasyonları ve DNA → mRNA → protein akışını etkileşimli 3B model üzerinde öğreten holografik genetik laboratuvarı.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
