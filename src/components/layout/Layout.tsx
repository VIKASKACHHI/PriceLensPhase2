import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 PriceLens. Compare prices, save money.</p>
        </div>
      </footer>
    </div>
  );
}
