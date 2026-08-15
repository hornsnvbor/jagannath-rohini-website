import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    dropdown: [
      { label: 'The Supreme God', href: '/the-supreme-god' },
      { label: 'About the Temple', href: '/about-the-temple' },
      { label: 'History', href: '/splendid-history-of-jagannath-temple-and-shree-neelachal-sewa-sangh' },
      { label: 'EC Members / Trustees', href: '/ec-members' },
      { label: 'Location', href: '/location' },
      { label: 'Events / Rath Yatra', href: '/rath-yatra' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    label: 'Prasad Booking',
    dropdown: [
      { label: 'Annaprasad & Sweets', href: '/prasad-booking' },
      { label: 'Day Prasad Sewan', href: '/?post_type=product&p=35263' },
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

export default function TempleHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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
          </div>
        </div>
      </div>

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
          </div>

          {/* Desktop Donate — always visible, distinct color */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/donate"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full ml-3 shadow-sm"
            >
              Donate Now
            </Link>
            {!showDonate && (
              <div className="mt-2 text-white text-center text-sm font-bold px-4 py-2">
                Donate Now
              </div>
            )}
          </div>

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
