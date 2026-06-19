import Link from 'next/link';
import { TextRotator } from '@/components/ui/TextRotator';
import { HungerCounter } from '@/components/ui/HungerCounter';
import styles from './page.module.css';

export default function Home() {
  const quotes = [
    "\"The food you waste today could be someone's meal tomorrow.\"",
    "\"Hunger is not caused by scarcity; it is caused by disconnection.\"",
    "\"Every plate shared is a step toward a hunger-free world.\"",
    "\"Food is a right, not a privilege.\""
  ];

  return (
    <div className="fade-in">
      {/* ═══ HERO ═══ */}
      <section className={styles.hero}>

        {/* Minimal Navigation */}
        <nav className={styles.heroNav}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/logo.png" 
              alt="NourishLink" 
              style={{ height: '28px', filter: 'invert(1) brightness(2)', objectFit: 'contain' }} 
            />
            <span className={styles.heroNavLogo}>NourishLink</span>
          </Link>
          <div className={styles.heroNavLinks}>
            <Link href="/login" className={styles.heroNavLink}>Login</Link>
            <Link href="/register" className={styles.heroNavLink}>Register</Link>
          </div>
        </nav>

        {/* Cinematic Photo Block */}
        <div className={styles.heroImageBlock}>
          <img
            src="/images/hero_documentary.png"
            alt="Volunteers serving meals to children at a community food distribution"
            className={styles.heroImage}
          />
          {/* Film Grain */}
          <div className={styles.heroGrain} />

          {/* Giant Typography Over the Image */}
          <div className={styles.heroTypographyOverlay}>
            <span className={styles.heroWordNourish}>Nourish</span>
            <span className={styles.heroWordLink}>Link</span>
          </div>
        </div>

        {/* Subtitle + CTAs below the image */}
        <div className={styles.heroContent}>
          <div className={styles.heroSubtitle}>
            <p className={styles.subtitleLead}>
              Every meal deserves a purpose.
            </p>
            <p className={styles.subtitleBody}>
              Connecting surplus food from restaurants and communities with orphanages, 
              NGOs, and those who need it most. No food wasted. No person forgotten.
            </p>
          </div>
          <div className={styles.ctaRow}>
            <Link href="/register?type=restaurant" className={styles.ctaBtnPrimary}>
              Donate Food
            </Link>
            <Link href="/register?type=ngo" className={styles.ctaBtn}>
              Request Help
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollLine} />
          <span className={styles.scrollText}>Scroll</span>
        </div>

      </section>

      {/* ═══ IMPACT FACTS ═══ */}
      <div className={styles.impactStrip}>
        <div className={styles.impactItem}>
          <span className={styles.impactValue}><HungerCounter /></span>
          <span className={styles.impactLabel}>Children died today (based on 7,000/day)</span>
        </div>
        <div className={styles.impactItem}>
          <span className={styles.impactValue}>68M</span>
          <span className={styles.impactLabel}>Tonnes of food wasted annually</span>
        </div>
        <div className={styles.impactItem}>
          <span className={styles.impactValue}>190M</span>
          <span className={styles.impactLabel}>Indians are undernourished</span>
        </div>
      </div>

      {/* ═══ QUOTES ═══ */}
      <section className={styles.quotesSection}>
        <div className={styles.quoteIcon}>&ldquo;</div>
        <div className={styles.quoteContainer}>
          <TextRotator texts={quotes} intervalMs={6000} />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>How NourishLink Works</h2>
          <p>Three simple steps to rescue food and feed communities in need.</p>
        </div>

        <div className="ario-grid">
          <div className="ario-cell">
            <span className={styles.stepNumber}>01</span>
            <h3 style={{ marginBottom: '1rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '2px', fontSize: '0.85rem' }}>
              Share Surplus
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', fontWeight: 300 }}>
              Easily log surplus food with quantity, type, and pickup window to help communities instantly.
            </p>
          </div>

          <div className="ario-cell">
            <span className={styles.stepNumber}>02</span>
            <h3 style={{ marginBottom: '1rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '2px', fontSize: '0.85rem' }}>
              Smart Connection
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', fontWeight: 300 }}>
              Our system instantly connects your generous donation to the best-fit orphanages and NGOs.
            </p>
          </div>

          <div className="ario-cell">
            <span className={styles.stepNumber}>03</span>
            <h3 style={{ marginBottom: '1rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '2px', fontSize: '0.85rem' }}>
              Fast Delivery
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', fontWeight: 300 }}>
              Real-time tracking ensures food is picked up and safely delivered to children and those in need.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
