'use client';
import { DevModeProvider } from '../context/dev-mode';
import Home from '../page';

export default function DevPage() {
  return (
    <DevModeProvider>
      <Home />
    </DevModeProvider>
  );
}
