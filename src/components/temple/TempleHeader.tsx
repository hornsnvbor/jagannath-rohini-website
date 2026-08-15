<<<<<<< HEAD
import { useEffect, useState, useLocation } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { getSiteSettings } from '../../lib/api';
=======
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
>>>>>>> d4daa6f (fixed homepage)

const navItems = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    dropdown: [
      { label: 'The Supreme God', href: '/the-supreme-god' },
      { label: 'About the Temple', href: '/about-the-temple' },
<<<<<<< HEAD
      { label: 'History', href: '/history' },
      { label: 'EC Members / Trustees', href: '/trustees' },
      { label: 'Location', href: '/location' },
      { label: 'Events', href: '/events' },
      { label: 'Rituals', href: '/rituals' },
      { label: 'Festival Calendar', href: '/festival-calendar' },
      { label: 'Blog', href: '/blog' }
    ]
=======
      { label: 'History', href: '/splendid-history-of-jagannath-temple-and-shree-neelachal-sewa-sangh' },
      { label: 'EC Members / Trustees', href: '/ec-members' },
      { label: 'Location', href: '/location' },
      { label: 'Events / Rath Yatra', href: '/rath-yatra' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blog', href: '/blog' },
    ],
>>>>>>> d4daa6f (fixed homepage)
  },
  {
    label: 'Prasad Booking',
    dropdown: [
      { label: 'Annaprasad & Sweets', href: '/prasad-booking' },
      { label: 'Day Prasad Sewan', href: '/?post_type=product&p=35263' },
<<<<<<< HEAD
      { label: 'Night Prasad Sewan', href: '/?post_type=product&p=2515' }
    ]
  },
  { label: 'Society Membership', href: '/membership' },
  { label: 'Dainik Sewa', href: '/seva' },
  { label: 'Documents', href: '/documents' },
  { label: 'Live Darshan', href: '/live-darshan' },
  { label: 'Temple Timings', href: '/temple-timings' },
  { label: 'Contact', href: '/contact' }
];

const logoPath = '/airo-assets/images/logo/horizontal.png';
=======
      { label: 'Night Prasad Sewan', href: '/?post_type=product&p=2515' },
    ],
  },
  { label: 'Society Membership', href: '/membership' },
  { label: 'Dainik Sewa', href: '/seva' },
  { label: 'Live Darshan', href: '/live-darshan' },
  { label: 'Temple Timings', href: '/temple-timings' },
  { label: 'Contact', href: '/contact' },
];

// Check for custom logo in localStorage or fall back to default
const storedLogo = localStorage.getItem('custom_logo');
const defaultLogo = '/airo-assets/images/logo/horizontal.png';
const logoPath = storedLogo ? storedLogo : defaultLogo;
>>>>>>> d4daa6f (fixed homepage)

export default function TempleHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
<<<<<<< HEAD
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
    let active = true;
    getSiteSettings()
      .then((s) => { if (active && s.logo_url) setLogoUrl(s.logo_url); })
      .catch(() => { /* backend unreachable — keep default logo */ });
    return () => { active = false; };
  }, []);

  const showDonate = isHome;

  const toggleMobile = () => setMobileOpen((v) => !v);
  const src = logoUrl || logoPath;

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      <div className="bg-primary py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 order-1 lg:order-none">
            <Link to="/" className="shrink-0">
              <img
                src={src}
                alt="Jagannath Mandir Rohini"
                className="h-20 lg:h-28 w-auto object-contain"
                loading="eager"
                fetchPriority="high" />
            </Link>
            <div className="text-yellow-950">
              <p className="text-base lg:text-lg font-bold leading-tight">Jagannath Mandir</p>
              <p className="text-xs lg:text-sm font-medium leading-snug">
                Rohini Sector 7, New Delhi
              </p>
              <a href="tel:7011510512" className="flex items-center gap-1 text-xs lg:text-sm font-medium hover:underline mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>7011510512
              </a>
              <a href="mailto:neelachalasevasangha@rediffmail.com" className="flex items-center gap-1 text-xs lg:text-sm font-medium hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="hidden sm:inline">info@</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 order-3 lg:order-none">
            <button
              onClick={toggleMobile}
              className="lg:hidden p-2 text-yellow-950"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            {showDonate && (
              <Link
                to="/donate"
                className="hidden lg:inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-3 rounded-full shadow-sm"
              >
                Donate Now
              </Link>
            )}
            {!showDonate && (
              <span className="hidden lg:inline-block text-white text-sm font-medium px-6 py-3">
                Donate Now
              </span>
            )}
=======
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);

  const handleLogoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem('custom_logo', reader.result as string);
          window.location.reload();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top bar — saffron */}
      <div className="bg-primary py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-primary-foreground text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:01146015314" className="flex items-center gap-1 hover:underline">
              <Phone size={13} />
              7011510512
            </a>
            <a href="mailto:neelachalasevasangha@rediffmail.com" className="flex items-center gap-1 hover:underline">
              <Mail size={13} />
              <span className="hidden sm:inline">info@</span>
            </a>
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              Jagannath Mandir, <strong>Rohini Sector 7</strong>, New Delhi
            </span>
          </div>

          {/* Logo with custom logo support */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logoPath}
                alt="Jagannath Mandir Rohini"
                className="h-12 w-auto object-contain"
                loading="eager"
                fetchPriority="high"
              />
            </Link>
            {/* Change logo button for admin users */}
            <Button
              type="button"
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium py-1 px-3 rounded"
              onClick={handleLogoChange}
            >
              Change Logo
            </Button>
>>>>>>> d4daa6f (fixed homepage)
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <nav className="bg-temple-dark hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center flex-wrap">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-white text-sm font-medium px-3 py-3 hover:text-yellow-300 transition whitespace-nowrap">
                  {item.label}
                  <ChevronDown size={12} />
                </button>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 min-w-52 shadow-lg z-50 py-1 bg-temple-dark border-t-2 border-primary">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.href}
                        className="block px-4 py-2 text-white text-sm hover:bg-primary hover:text-white transition whitespace-nowrap"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.href!}
                className="text-white text-sm font-medium px-3 py-3 hover:text-yellow-300 transition whitespace-nowrap"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      </nav>

      {mobileOpen && (
        <nav className="bg-temple-dark lg:hidden shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="py-1">
                  <p className="text-white text-sm font-semibold py-2 uppercase tracking-wide">{item.label}</p>
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.href}
                      onClick={toggleMobile}
                      className="block py-1.5 pl-3 text-white/85 text-sm hover:text-yellow-300 transition"
                    >
                      {sub.label}
                    </Link>
                  ))}
=======
      {/* Main nav — dark */}
      <nav className="bg-temple-dark">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center py-2 shrink-0">
            <img
              src={logoPath}
              alt="Jagannath Mandir Rohini"
              className="h-12 w-auto object-contain"
              loading="eager"
              fetchPriority="high"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center flex-wrap">
            {navItems.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-white text-xs font-medium px-2 py-3 hover:text-primary transition whitespace-nowrap">
                    {item.label}
                    <ChevronDown size={12} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 min-w-48 shadow-lg z-50 py-1 bg-temple-dark">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className="block px-4 py-2 text-white text-xs hover:bg-primary hover:text-primary-foreground transition whitespace-nowrap"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
>>>>>>> d4daa6f (fixed homepage)
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
<<<<<<< HEAD
                  onClick={toggleMobile}
                  className="text-white text-sm font-medium py-2 hover:text-yellow-300 transition"
=======
                  className="text-white text-xs font-medium px-2 py-3 hover:text-primary transition whitespace-nowrap"
>>>>>>> d4daa6f (fixed homepage)
                >
                  {item.label}
                </Link>
              )
            )}
<<<<<<< HEAD
            <Link
              to="/donate"
              onClick={toggleMobile}
              className="mt-2 bg-red-600 text-white text-center text-sm font-bold px-4 py-2 rounded-full shadow-sm"
=======
          </div>

          {/* Desktop Donate — always visible, distinct color */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/donate"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full ml-3 shadow-sm"
>>>>>>> d4daa6f (fixed homepage)
            >
              Donate Now
            </Link>
            {!showDonate && (
              <div className="mt-2 text-white text-center text-sm font-bold px-4 py-2">
                Donate Now
              </div>
            )}
          </div>
<<<<<<< HEAD
        </nav>
      )}
    </header>
  );
}
=======

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-temple-dark border-t border-white/10">
            <div className="px-4 py-2 flex flex-col">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.label} className="border-b border-white/10">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-white text-sm font-medium py-3"
                      onClick={() =>
                        setMobileDropdown((cur) => (cur === item.label ? null : item.label))
                      }
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={mobileDropdown === item.label ? 'rotate-180 transition-transform' : 'transition-transform'}
                      />
                    </button>
                    {mobileDropdown === item.label && (
                      <div className="pb-2 pl-3 flex flex-col">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.href}
                            className="text-white/90 text-sm py-2 hover:text-primary transition"
                            onClick={() => setMobileOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href!}
                    className="text-white text-sm font-medium py-3 border-b border-white/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                to="/donate"
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-3 rounded-full text-center my-3"
                onClick={() => setMobileOpen(false)}
              >
                Donate Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
>>>>>>> d4daa6f (fixed homepage)
