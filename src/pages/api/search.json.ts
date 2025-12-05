import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export const GET:APIRoute = async ({ url }): Promise<Response> => {
    const rawQuery: string | null = url.searchParams.get('query');

    if(rawQuery === null || rawQuery.trim().length === 0){
        return new Response(JSON.stringify({
            error: 'Query param is missing'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const query = rawQuery.trim().toLowerCase();

    const allBlogArticles: CollectionEntry<'blog'> [] = await getCollection('blog');

    const searchResults  = allBlogArticles.filter(article => {
        const titleMatch: boolean = article.data.title
        .toLowerCase()
        .includes(query);
    
        const bodyMatch: boolean = article.body
        .toLowerCase()
        .includes(query);
    
        const slugMatch: boolean = article.slug
        .toLowerCase()
        .includes(query);
    
        return titleMatch || bodyMatch || slugMatch;
    });

    return new Response(JSON.stringify(searchResults), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });

};