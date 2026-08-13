import { useParams, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title?: string;
}

function titleFromSlug(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  const params = useParams();
  const location = useLocation();

  const resolvedTitle =
    title ||
    (params.slug ? titleFromSlug(params.slug) : titleFromSlug(location.pathname.replace(/^\//, '').split('/').pop() || 'Page'));

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {resolvedTitle}
      </h1>
      <div className="mx-auto h-1 w-16 rounded bg-primary mb-6" />
      <p className="text-gray-500 mb-8">
        This page is coming soon. Content for "{resolvedTitle}" will be added here.
      </p>
      <Link
        to="/"
        className="inline-block bg-primary text-white font-semibold px-6 py-2 rounded hover:bg-primary/90 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
