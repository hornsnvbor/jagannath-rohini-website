import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
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
      { label: 'Blog', href: '/blog' }
    ]
  },
  {
    label: 'Prasad Booking',
    dropdown: [
      { label: 'Annaprasad & Sweets', href: '/prasad-booking' },
      { label: 'Day Prasad Sewan', href: '/?post_type=product&p=35263' },
      { label: 'Night Prasad Sewan', href: '/?post_type=product&p=2515' }
    ]
  },
  { label: 'Society Membership', href: '/membership' },
  { label: 'Dainik Sewa', href: '/seva' },
  { label: 'Live Darshan', href: '/live-darshan' },
  { label: 'Temple Timings', href: '/temple-timings' },
  { label: 'Contact', href: '/contact' }
];

const storedLogo = localStorage.getItem('custom_logo');
const defaultLogo = '/airo-assets/images/logo/horizontal.png';
const logoPath = storedLogo ? storedLogo : defaultLogo;

export default function TempleHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleLogoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
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
      <div className="bg-primary py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-primary-foreground text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:01146015314" className="flex items-center gap-1 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>7011510512</a>
            <a href="mailto:neelachalasevasangha@rediffmail.com" className="flex items-center gap-1 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="hidden sm:inline">info@</span>
            </a>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Jagannath Mandir, <strong>Rohini Sector 7</strong>, New Delhi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src={logoPath}
                  alt="Jagannath Mandir Rohini"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                  fetchPriority="high" />
              </Link>
              <Button
                className="bg-yellow-500 text-white text-xs font-medium py-1 px-3 rounded"
                onClick={handleLogoChange}
              >
                Change Logo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-temple-dark">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center py-2 shrink-0">
            <img
              src={logoPath}
              alt="Jagannath Mandir Rohini"
              className="h-12 w-auto object-contain"
              loading="eager"
              fetchPriority="high" />
          </Link>

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
                  className="text-white text-xs font-medium px-2 py-3 hover:text-primary transition whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/donate"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full ml-3 shadow-sm"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
