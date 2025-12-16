import { NextRequest, NextResponse } from 'next/server'

interface Paper {
    title: string
    authors: string[]
    year: string
    abstract: string
    citations: number
    url: string
    pdfUrl?: string
    source: string
    venue?: string
}

async function searchSemanticScholar(query: string): Promise<Paper[]> {
    try {
        const response = await fetch(
            `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,abstract,citationCount,url,openAccessPdf,venue`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        )

        if (!response.ok) return []

        const data = await response.json()

        return (data.data || []).map((paper: any) => ({
            title: paper.title || 'Untitled',
            authors: paper.authors?.map((a: any) => a.name) || [],
            year: paper.year?.toString() || 'N/A',
            abstract: paper.abstract || 'No abstract available',
            citations: paper.citationCount || 0,
            url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
            pdfUrl: paper.openAccessPdf?.url,
            source: 'Semantic Scholar',
            venue: paper.venue
        }))
    } catch (error) {
        console.error('Semantic Scholar search error:', error)
        return []
    }
}

async function searchArxiv(query: string): Promise<Paper[]> {
    try {
        const response = await fetch(
            `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`
        )

        if (!response.ok) return []

        const xmlText = await response.text()

        // Parse XML (basic parsing for demo)
        const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || []

        return entries.map(entry => {
            const getTag = (tag: string) => {
                const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`))
                return match ? match[1].trim() : ''
            }

            const authors = entry.match(/<author>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/g)
                ?.map(a => a.match(/<name>([^<]+)<\/name>/)?.[1] || '') || []

            return {
                title: getTag('title').replace(/\n/g, ' '),
                authors: authors,
                year: getTag('published').substring(0, 4) || 'N/A',
                abstract: getTag('summary').replace(/\n/g, ' '),
                citations: 0,
                url: getTag('id'),
                pdfUrl: getTag('id').replace('/abs/', '/pdf/'),
                source: 'arXiv',
                venue: 'arXiv Preprint'
            }
        })
    } catch (error) {
        console.error('arXiv search error:', error)
        return []
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter required' },
                { status: 400 }
            )
        }

        // Search multiple sources in parallel
        const [semanticResults, arxivResults] = await Promise.all([
            searchSemanticScholar(query),
            searchArxiv(query)
        ])

        // Combine and deduplicate results
        const allResults = [...semanticResults, ...arxivResults]

        // Sort by citations (higher first)
        allResults.sort((a, b) => b.citations - a.citations)

        return NextResponse.json({
            success: true,
            query,
            totalResults: allResults.length,
            results: allResults.slice(0, 15) // Return top 15
        })

    } catch (error: any) {
        console.error('Research search error:', error)
        return NextResponse.json(
            { error: 'Failed to search', details: error.message },
            { status: 500 }
        )
    }
}
