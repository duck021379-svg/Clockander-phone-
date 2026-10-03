import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export const apiRouter = express.Router();
apiRouter.use(express.json());

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

apiRouter.post('/gemini/assist', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A prompt string is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const systemInstruction = `You are Clockander AI, the intelligent Moto Edge+ Android smart calendar & Google Keep assistant.
You assist the user with calendar scheduling, agenda organization, and Google Keep quick task and note management.
You run inside a Motorola Edge+ (2022) glassmorphic widget interface.

Today's Date/Time Reference: ${context?.currentTime || new Date().toISOString()}.
User's currently selected date: ${context?.selectedDate || 'Today'}.
Current events in view: ${JSON.stringify(context?.events?.slice(0, 8) || [])}
Current Keep notes/tasks: ${JSON.stringify(context?.tasks?.slice(0, 8) || [])}

Analyze the user's prompt carefully.
1. If the user wants to add, schedule, or adjust an event, extract it into 'newEvent'.
2. If the user wants to create a Keep note or checklist, extract it into 'newKeepNote'.
3. Always provide a friendly, concise, natural response text summarizing the action or answering their query with Moto Glance brevity.

Event format:
- title: string
- date: YYYY-MM-DD
- startTime: HH:MM (24-hour format)
- endTime: HH:MM (24-hour format, default 1 hour after startTime if not specified)
- category: one of ["work", "personal", "meeting", "fitness", "reminder"]
- description: string

Keep note format:
- title: string
- content: string (short note)
- items: array of { id: string, text: string, completed: boolean } (if checklist)
- color: one of ["yellow", "coral", "teal", "lavender", "mint", "dark"]
- tags: array of strings (e.g. ["urgent", "groceries", "ideas", "moto"])
- pinned: boolean
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyMessage: {
              type: Type.STRING,
              description: 'Crisp, helpful response to the user.',
            },
            actionType: {
              type: Type.STRING,
              description: 'Primary action detected: "create_event", "create_keep_note", "both", "briefing", or "general".',
            },
            newEvent: {
              type: Type.OBJECT,
              description: 'Optional new calendar event extracted from user prompt.',
              properties: {
                title: { type: Type.STRING },
                date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                startTime: { type: Type.STRING, description: 'HH:MM' },
                endTime: { type: Type.STRING, description: 'HH:MM' },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            newKeepNote: {
              type: Type.OBJECT,
              description: 'Optional Google Keep note / checklist extracted from user prompt.',
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      completed: { type: Type.BOOLEAN },
                    },
                    required: ['text'],
                  },
                },
                color: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                pinned: { type: Type.BOOLEAN },
              },
            },
            dailyBriefingSummary: {
              type: Type.STRING,
              description: 'High-level Moto Glance summary if user asked for briefing or summary.',
            },
          },
          required: ['replyMessage', 'actionType'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: 'No response received from Gemini' });
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process AI request with Gemini.',
    });
  }
});
