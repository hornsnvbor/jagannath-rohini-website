import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        404 — Page Not Found
      </h1>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="bg-primary text-white font-semibold px-6 py-2 rounded hover:bg-primary/90 transition">
        Back to Home
      </Link>
    </div>
  );
}
