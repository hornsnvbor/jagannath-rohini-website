import { Link } from 'react-router-dom';

const beshas = [
  {
    title: 'Bana Bhoji Besha',
    excerpt:
      'Lord Jagannatha has been identified with Krishna and most of the rituals performed in Sreemandir are based on the life of Krishna. The Bana Bhoji Besha is one of the most elaborate and visually stunning costumes…',
    image: '/airo-assets/images/besha/bana-bhoji.jpg',
    href: '/blog',
  },
  {
    title: 'Suna Besha',
    excerpt:
      'The Suna Besha is also known as the Raja Besha or the Rajarajeshwara Besha. It is one of the most spectacular and grand Beshas of Lord Jagannath, performed on special occasions with gold ornaments…',
    image: '/airo-assets/images/besha/suna-besha.jpg',
    href: '/blog',
  },
  {
    title: 'Tahiya Lagi Besha',
    excerpt:
      'The Tahiya Lagi Besha is performed during the Rath Yatra festival. Tahiya is a floral crown made of flowers and leaves, symbolizing the divine connection between nature and the deity…',
    image: '/airo-assets/images/besha/tahiya-lagi.jpg',
    href: '/blog',
  },
];

export default function BeshasSection() {
  return (
    <section className="py-12 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className="font-bold text-foreground mb-2"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '28px' }}
          >
            Beshas of Lord Jagannath
          </h2>
          <div className="mx-auto h-1 w-16 rounded bg-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beshas.map((besha) => (
            <div
              key={besha.title}
              className="flex flex-col sm:flex-row gap-0 bg-card rounded-xl shadow-md overflow-hidden border border-border"
            >
              <div className="sm:w-40 shrink-0 h-48 sm:h-auto overflow-hidden">
                <img
                  src={besha.image}
                  alt={besha.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={300}
                  height={300}
                />
              </div>
              <div className="p-5 flex flex-col justify-between">
                <div>
                  <h3
                    className="font-bold text-foreground mb-2 text-base"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {besha.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{besha.excerpt}</p>
                </div>
                <Link
                  to={besha.href}
                  className="mt-4 inline-block bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded transition hover:bg-primary/90 self-start"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
