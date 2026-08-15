const videos = [
  'https://www.youtube.com/embed/rkgIdy9aQv4',
  'https://www.youtube.com/embed/sB3hFY9xlMU',
  'https://www.youtube.com/embed/kSJT8T_Z0SU',
  'https://www.youtube.com/embed/I7YWww_REBU',
  'https://www.youtube.com/embed/07gW2xUhOVc',
];

export default function FeaturedVideos() {
  return (
    <section className="py-12 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className="font-bold text-foreground mb-2"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '28px' }}
          >
            Featured Videos
          </h2>
          <div className="mx-auto h-1 w-16 rounded bg-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-md bg-background">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={src}
                  title={`Featured Video ${i + 1}`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
