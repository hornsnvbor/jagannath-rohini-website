import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { useSiteContent, type FooterContent } from '@/lib/siteContent';

const tags = [
{ label: 'Car Festival', href: '/blog' },
{ label: 'Dressing the Divine', href: '/blog' },
{ label: 'Events', href: '/events' },
{ label: 'Festival', href: '/festival-calendar' },
{ label: 'Rath Yatra', href: '/rath-yatra' },
{ label: 'Rituals', href: '/rituals' },
{ label: 'Temple Timings', href: '/temple-timings' },
{ label: 'History', href: '/history' },
{ label: 'Blog', href: '/blog' }];


export default function TempleFooter() {
  const footer = useSiteContent<FooterContent>('footer');
  return (
    <footer>
      {/* Main footer */}
      <div className="bg-temple-dark py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          {/* Column 1 — Latest Post */}
          <div>
            <h4
              className="font-bold text-primary mb-4 pb-2 border-b border-primary/30 uppercase tracking-wide text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}>
              
              Latest Post
            </h4>
            <div>
              <Link
                to="/blog"
                className="text-white hover:text-primary transition font-semibold text-sm">
                
                Read our Latest Posts
              </Link>
              <p className="text-white/50 text-xs mt-1">Stories, festivals & updates</p>
            </div>

            {/* Gajapati message */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-white/60 text-xs mb-2">Message from Gajapati Maharaja Dibyasingha Deb ji</p>
              <a
                href="https://jagannathmandirdelhi.com/assets/message-from-puri-jagapati.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-primary hover:text-primary/80 text-xs underline">
                
                Message from Gajapati Maharaja Dibyasingha Deb ji — Download
              </a>
            </div>
          </div>

          {/* Column 2 — About the Temple */}
          <div>
            <h4
              className="font-bold text-primary mb-4 pb-2 border-b border-primary/30 uppercase tracking-wide text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}>
              
              About the Temple
            </h4>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              The Jagannath Mandir, Rohini presents an excellent architecture, with exquisite carvings and lovely wall
              paintings (Patta Chitra). A two-storied structure, the Temple's Ground Floor is where Goddess Mausi Maa
              is worshipped.
            </p>            <div className="text-sm text-white/70 space-y-1">
              <p className="font-semibold text-white">Mailing Address:</p>
              <p>{footer.address}</p>
              <p className="mt-2">
                <span className="text-primary">Email:</span>{' '}
                <a href={`mailto:${footer.email}`} className="hover:text-primary transition break-all">{footer.email}</a>
              </p>
              <p>
                <a href={`mailto:${footer.email2}`} className="hover:text-primary transition break-all">{footer.email2}</a>
              </p>
              <p className="mt-2">
                <span className="text-primary">Prasad Booking:</span>{' '}
                <a href={`tel:+91${footer.prasadPhone}`} className="hover:text-primary transition">{footer.prasadPhone}</a>
              </p>
              <p>
                <span className="text-primary">Phone:</span>{' '}
                <a href={`tel:${footer.phone1.replace(/-/g, '')}`} className="hover:text-primary transition">{footer.phone1}</a>
                ,{' '}
                <a href={`tel:${footer.phone2.replace(/-/g, '')}`} className="hover:text-primary transition">{footer.phone2}</a>
              </p>
            </div>
          </div>

          {/* Column 3 — Tags */}
          <div>
            <h4
              className="font-bold text-primary mb-4 pb-2 border-b border-primary/30 uppercase tracking-wide text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}>
              
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) =>
              <Link
                key={tag.label}
                to={tag.href}
                className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/70 hover:bg-primary hover:border-primary hover:text-primary-foreground transition">
                
                  {tag.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Policy + social */}
      <div className="bg-temple-dark-deeper py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap justify-center gap-3 text-xs text-white/50">
            {[
            { label: 'Terms & Conditions', href: '/terms-conditions' },
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Cancellation & Refund', href: '/cancellation-refund' },
            { label: 'Disclaimer', href: '/disclaimer' }].
            map((link, i, arr) =>
            <span key={link.label} className="flex items-center gap-3">
                <Link to={link.href} className="hover:text-primary transition">
                  {link.label}
                </Link>
                {i < arr.length - 1 && <span className="text-white/20">|</span>}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/SreeNeelachalaSevaSangha" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://www.instagram.com/jagannath_mandir_hauzkhas/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://www.youtube.com/channel/UC6xwf_MaEZRyVO_wC8XtrEQ" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition" aria-label="YouTube">
              <Youtube size={18} />
            </a>
            <a href="https://twitter.com/home" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-3 text-center text-xs text-white/40">
          Copyright © 2026 Sree Neelachala Seva Sangha.
        </div>
      </div>

      {/* Notice bar */}
      <div className="bg-primary py-3 px-4">
        <p className="text-primary-foreground text-xs text-center max-w-5xl mx-auto leading-relaxed">
          {footer.notice}
        </p>
      </div>
    </footer>);

}