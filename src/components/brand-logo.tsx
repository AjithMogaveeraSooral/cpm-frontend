import Image from 'next/image';
import logo from '../../public/brand/cypress-logo.png';

/** The supplied Cypress artwork, arranged horizontally for readable navigation. */
export function BrandLogo({ className = 'h-auto w-[220px] max-w-full', priority = false }: { className?: string; priority?: boolean }) {
  return <Image src={logo} alt="Cypress Property Management Software" className={className} width={680} height={170} sizes="220px" priority={priority} />;
}