import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'Ganpati Bappa Morya',
    excerpt:
      'Vakratuṇḍa mahākāya sūryakoṭi samaprabha | Nirvighnaṃ kuru me deva sarvakāryeṣu sarvadā || Ganesh Chaturthi is one of the most celebrated Hindu festivals…',
    image: '/airo-assets/images/blog/ganesh-chaturthi.jpg',
    href: '/blog/ganpati-bappa-morya',
  },
  {
    title: 'II Oṃ śrī kṛṣṇāya namaḥ II',
    excerpt:
      'Every time, when goodness is suppressed by evil, when people are subjected to atrocities, the divine incarnates to restore dharma and protect the righteous…',
    image: '/airo-assets/images/blog/krishna-janmashtami.jpg',
    href: '/blog/om-sri-krishnaya-namah',
  },
  {
    title: 'Balabhadra Janma',
    excerpt:
      "The full moon day in the month of Sravana also known as 'Sravana Purnima' marks the auspicious birth anniversary of Lord Balabhadra, the elder brother of Lord Jagannath…",
    image: '/airo-assets/images/blog/balabhadra-janma.jpg',
    href: '/blog/balabhadra-janma',
  },
];

export default function BlogSection() {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h2
            className="font-bold text-foreground mb-2"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}
          >
            Discovering the 32 Beshas of Lord Jagannath in Our Weekly Blog Post
          </h2>
          <div className="mx-auto h-1 w-16 rounded bg-primary mb-4" />
          <p className="text-muted-foreground max-w-3xl mx-auto text-sm leading-relaxed">
            Lord Jagannath's abode in Puri is an epitome of an inseparable relationship between the God and humans. Or
            perhaps the oneness of both. One such example is the 32 different Beshas adorned by Lord Jagannath and his
            sibling deities Lord Balabhadra and Devi Subhadra. Besha is a Sanskrit word, which means costume or
            attire…
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {posts.map((post) => (
            <div
              key={post.title}
              className="rounded-xl overflow-hidden shadow-md bg-card border border-border flex flex-col"
            >
              <div className="overflow-hidden h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  width={400}
                  height={250}
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3
                  className="font-bold text-foreground mb-2 text-base"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{post.excerpt}</p>
                <Link
                  to={post.href}
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
