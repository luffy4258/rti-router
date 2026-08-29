import './globals.css';

export const metadata = {
  title: 'RTI Router — find the right public authority',
  description: 'An independent prototype for routing central RTI applications.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
