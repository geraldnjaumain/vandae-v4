import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
    try {
        const { messages, fileIds } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "AI Service Configuration Error (Missing API Key)" }, { status: 500 });
        }

        let context = "";

        // RAG: Fetch and process selected files
        if (fileIds && fileIds.length > 0) {
            console.log(`Processing ${fileIds.length} files for context...`);
            const supabase = await createClient();

            // 1. Fetch file metadata
            const { data: files } = await supabase
                .from('resources')
                .select('*')
                .in('id', fileIds);

            if (files && files.length > 0) {
                for (const file of files) {
                    try {
                        // 2. Download file from storage
                        const { data: fileData, error: downloadError } = await supabase
                            .storage
                            .from('vault')
                            .download(file.file_url);

                        if (downloadError || !fileData) {
                            console.warn(`Failed to download file ${file.title}:`, downloadError);
                            continue;
                        }

                        // 3. Extract text
                        let textContent = "";
                        const arrayBuffer = await fileData.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);

                        if (file.file_type === 'pdf') {
                            const pdfParseModule = await import('pdf-parse');
                            // @ts-ignore
                            const pdf = pdfParseModule.default || pdfParseModule;
                            const pdfData = await pdf(buffer);
                            textContent = pdfData.text;
                        } else if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'css', 'html'].includes(file.file_type)) {
                            textContent = buffer.toString('utf-8');
                        } else {
                            // Skip unsupported types for now
                            continue;
                        }

                        // 4. Append to context
                        // Truncate if too long (rough safety check)
                        const truncatedText = textContent.slice(0, 10000);
                        context += `\n\n--- FILE: ${file.title} ---\n${truncatedText}`;

                    } catch (err) {
                        console.error(`Error processing file ${file.title}:`, err);
                    }
                }
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Build history with context
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Inject context into the last message or as a system-like prompt
        let lastMessageContent = messages[messages.length - 1].content;

        if (context) {
            const systemContext = `
You are Vadea AI, an academic assistant.
The user has provided the following files as context for this conversation. 
Use this information to answer their questions accurately.

CONTEXT FILES:
${context}

END OF CONTEXT
`;
            // Prepend context to the last user message
            lastMessageContent = `${systemContext}\n\nUser Question: ${lastMessageContent}`;
        }

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 2000, // Increased for RAG answers
            },
        });

        const result = await chat.sendMessage(lastMessageContent);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ role: 'assistant', content: text });
    } catch (error: any) {
        console.error("Gemini API Error Detail:", error);
        return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
    }
}
