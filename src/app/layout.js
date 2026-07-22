import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'AuraHRM - Human Resource Management Module',
  description: 'Enterprise Human Resource Management ERP Module with Applicant Status Tracking & Onboarding Pipelines',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <main style={{ flex: 1, padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
