import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Link } from 'react-router-dom';

const slides = [
{
  id: 1,
  image: '/airo-assets/images/hero/slide-1-rath-yatra.jpg',
  headline: 'SREE JAGANNATH RATHA YATRA 2026',
  subtext: 'Ratha Yatra on 16-07-2026 (Thursday)',
  location: 'JAGANNATH TEMPLE, ROHINI, NEW DELHI',
  cta: { label: 'Donate Now', href: '/prasad-booking' }
},
{
  id: 2,
  image: '/airo-assets/images/hero/slide-2-annadaan.jpg',
  headline: 'Maha Annadaan — Narayan Seva',
  subtext: 'Prasad Sewan — Rs. 11,000 for 100 persons | Rs. 5,500 for 50 persons',
  cta: { label: 'Donate Now', href: '/prasad-booking' }
},
{
  id: 3,
  image: '/airo-assets/images/hero/slide-3-celebration.jpg',
  headline: 'Divine celebrations at Jagannath Mandir, Rohini!',
  subtext: 'Feel the bliss of the sacred Shree Jagannath Rath Yatra 🛕',
  cta: { label: 'Click Here', href: '/2023/04/04/rath-yatra' }
},
{ id: 4, image: '/airo-assets/images/hero/slide-4-deity.jpg' },
{ id: 5, image: '/airo-assets/images/hero/slide-5-aarti.jpg' },
{ id: 6, image: '/airo-assets/images/hero/slide-6-rathyatra-crowd.jpg' },
{ id: 7, image: '/airo-assets/images/hero/slide-7-deities.jpg' },
{ id: 8, image: '/airo-assets/images/hero/slide-8-devotees.jpg' }];


export default function HeroCarousel() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  return (
    <section>
      <div className="relative" role="region" aria-roledescription="carousel" aria-label="Temple highlights">
        <Carousel opts={{ loop: true }} plugins={[autoplay.current]}>
          <CarouselContent>
            {slides.map((slide) =>
            <CarouselItem key={slide.id}>
                <div className="relative w-full" style={{ height: '520px' }}>
                  <img
                  src={slide.image}
                  alt={'headline' in slide && slide.headline ? slide.headline : `Temple slide ${slide.id}`}
                  className="w-full h-full object-cover"
                  loading={slide.id === 1 ? 'eager' : 'lazy'}
                  fetchPriority={slide.id === 1 ? 'high' : 'auto'} />
                
                  {'headline' in slide && slide.headline &&
                <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 pointer-events-none">
                        <div className="max-w-xl pointer-events-auto">
                          {slide.id === 1 ?
                      <p
                        className="text-white font-bold mb-3 leading-tight"
                        style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 4vw, 42px)' }}>
                        
                              {slide.headline}
                            </p> :

                      <p
                        className="text-white font-bold mb-3 leading-tight"
                        style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 4vw, 42px)' }}>
                        
                              {slide.headline}
                            </p>
                      }
                          {slide.subtext &&
                      <p className="text-primary text-base md:text-lg mb-2">{slide.subtext}</p>
                      }
                          {'location' in slide && slide.location &&
                      <p className="text-white font-semibold text-sm mb-4">{slide.location}</p>
                      }
                          {slide.cta &&
                      <Link
                        to={slide.cta.href}
                        className="inline-block bg-primary text-primary-foreground font-bold px-6 py-2 rounded transition hover:bg-primary/90">
                        
                              {slide.cta.label}
                            </Link>
                      }
                        </div>
                      </div>
                    </>
                }
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-4 text-white border-white/50 bg-black/40 hover:bg-primary hover:border-primary" />
          <CarouselNext className="right-4 text-white border-white/50 bg-black/40 hover:bg-primary hover:border-primary" />
        </Carousel>
      </div>

      {/* Booking tiles */}
      <div className="bg-primary py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 px-4">
          <Link
            to="/prasad-booking"
            className="flex items-center gap-3 bg-background rounded-lg px-6 py-3 shadow hover:shadow-md transition">
            
            <img
              src="/airo-assets/images/components/annaprasad-booking-tile.png"
              alt="Annaprasad Booking"
              className="h-12 w-auto object-contain"
              loading="lazy" />
            
          </Link>
          <Link
            to="/rituals"
            className="flex items-center gap-3 bg-background rounded-lg px-6 py-3 shadow hover:shadow-md transition">
            
            <img
              src="/airo-assets/images/components/temple-herocarousel/rituals-booking.png"
              alt="Rituals Booking"
              className="h-12 w-auto object-contain"
              loading="lazy" />
            
          </Link>
        </div>
      </div>
    </section>);

}