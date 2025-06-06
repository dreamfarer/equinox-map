import { permanentRedirect } from 'next/navigation';

export default function LandingPage() {
  permanentRedirect('/filter');
}
