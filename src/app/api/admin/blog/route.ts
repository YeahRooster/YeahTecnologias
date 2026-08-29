import { NextResponse } from 'next/server';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Obtener todos los posts (incluyendo inactivos/borradores)
export async function GET() {
    try {
        const posts = await getAllBlogPosts();
        return NextResponse.json(posts);
    } catch (error: any) {
        console.error('Error fetching admin blog posts:', error);
        return NextResponse.json({ error: error.message || 'Error al obtener los posts' }, { status: 500 });
    }
}

// POST: Crear nuevo post
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.title || !body.content) {
            return NextResponse.json({ error: 'Título y contenido son obligatorios' }, { status: 400 });
        }

        const idPost = await createBlogPost({
            slug: body.slug || '',
            title: body.title,
            excerpt: body.excerpt || '',
            content: body.content,
            date: body.date || '',
            category: body.category || 'General',
            tags: body.tags || [],
            imageUrl: body.imageUrl || '/blog/cables-carga-lenta.png',
            activo: body.activo !== false,
        });

        return NextResponse.json({ success: true, id: idPost, message: 'Post creado correctamente' });
    } catch (error: any) {
        console.error('Error creating blog post:', error);
        return NextResponse.json({ error: error.message || 'Error al crear el post' }, { status: 500 });
    }
}

// PUT: Actualizar post existente
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'ID del post es obligatorio' }, { status: 400 });
        }

        const updated = await updateBlogPost(body.id, {
            slug: body.slug,
            title: body.title,
            excerpt: body.excerpt,
            content: body.content,
            date: body.date,
            category: body.category,
            tags: body.tags,
            imageUrl: body.imageUrl,
            activo: body.activo,
        });

        if (!updated) {
            return NextResponse.json({ error: 'No se encontró el post a actualizar' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Post actualizado correctamente' });
    } catch (error: any) {
        console.error('Error updating blog post:', error);
        return NextResponse.json({ error: error.message || 'Error al actualizar el post' }, { status: 500 });
    }
}

// DELETE: Eliminar post
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
        }

        const deleted = await deleteBlogPost(id);

        if (!deleted) {
            return NextResponse.json({ error: 'No se encontró el post a eliminar' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Post eliminado correctamente' });
    } catch (error: any) {
        console.error('Error deleting blog post:', error);
        return NextResponse.json({ error: error.message || 'Error al eliminar el post' }, { status: 500 });
    }
}
