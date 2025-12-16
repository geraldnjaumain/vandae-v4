import { getAllBlogPosts } from '@/lib/blog'

export default async function rss() {
    const posts = await getAllBlogPosts()
    const baseUrl = 'https://vadea.app'

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vadea Blog - Study Tips & Academic Success</title>
    <link>${baseUrl}/blog</link>
    <description>Expert advice on studying, productivity, time management, and academic success</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
            .map(
                (post) => `
    <item>
      <title>${post.title}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description>${post.description}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <category>${post.category}</category>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join('\n      ')}
    </item>`
            )
            .join('')}
  </channel>
</rss>`

    return new Response(rss, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
        },
    })
}
