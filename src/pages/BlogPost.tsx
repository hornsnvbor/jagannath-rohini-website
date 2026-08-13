import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { getBlogPost, type BlogPost } from '@/lib/api';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getBlogPost(slug)
      .then(setPost)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-heading font-bold text-temple-dark mb-2">Post not found</h1>
        <Link to="/blog" className="text-primary hover:underline text-sm">
          ← Back to Blog
        </Link>
      </main>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title} — Jagannath Mandir Rohini</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/blog" className="text-primary hover:underline text-sm mb-6 inline-block">
          ← Back to Blog
        </Link>
        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="w-full rounded-lg mb-6 aspect-video object-cover" />
        )}
        <h1 className="text-3xl font-heading font-bold text-temple-dark mb-4">{post.title}</h1>
        <div className="prose max-w-none whitespace-pre-wrap text-foreground/90">{post.content}</div>
      </main>
    </>
  );
}
