import { NextResponse } from 'next/server';
import { getPublicBlogPosts } from '@/lib/googleSheets';
import { blogPosts as fallbackPosts } from '@/data/blogPosts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const posts = await getPublicBlogPosts();
        if (posts && posts.length > 0) {
            return NextResponse.json(posts);
        }
        return NextResponse.json(fallbackPosts);
    } catch (error) {
        console.error('Error fetching public blog posts from Google Sheets:', error);
        return NextResponse.json(fallbackPosts);
    }
}
