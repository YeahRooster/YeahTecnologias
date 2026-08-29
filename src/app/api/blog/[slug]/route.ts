import { NextResponse } from 'next/server';
import { getBlogPostBySlug } from '@/lib/googleSheets';
import { getPostBySlug as getFallbackPostBySlug } from '@/data/blogPosts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const post = await getBlogPostBySlug(slug);

        if (post) {
            return NextResponse.json(post);
        }

        const fallback = getFallbackPostBySlug(slug);
        if (fallback) {
            return NextResponse.json(fallback);
        }

        return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    } catch (error) {
        console.error('Error fetching blog post by slug:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
