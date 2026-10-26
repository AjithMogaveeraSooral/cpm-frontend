import Image from 'next/image';
import logo from '../../public/brand/cypress-logo.png';
import s from './brand-logo.module.css';

/** Preserve the supplied artwork and recolour its transparent silhouette with the active palette. */
export function BrandLogo({ className = 'h-auto w-[220px] max-w-full', priority = false }: { className?: string; priority?: boolean }) {
  return <span role="img" aria-label="Cypress Property Management" className={`${s.logo} ${className}`} style={{ maskImage: `url("${logo.src}")`, WebkitMaskImage: `url("${logo.src}")` }}>
    <Image src={logo} alt="" aria-hidden="true" className={s.dimensions} width={680} height={170} sizes="220px" priority={priority} />
  </span>;
}