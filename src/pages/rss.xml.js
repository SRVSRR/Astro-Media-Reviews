import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');

  return rss({
    title: 'SRVSRR — Data Scientist & Data Engineer',
    description: 'Full-stack ML, data engineering, and software engineering notes.',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map(post => ({
        title: post.data.title,
        link: `/articles/${post.slug}`,
        pubDate: post.data.pubDate,
        author: post.data.author,
        content: post.body,
        categories: post.data.tags,
      })),
    customData: `<language>en-us</language>`,
  });
}