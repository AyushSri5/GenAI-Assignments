import 'dotenv/config'
import { MemoryClient } from 'mem0ai'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
console.log("MEM0_API_KEY:", process.env.MEM0AI_API_KEY);
const mem = new MemoryClient({
  // comes from mem0 dashboard
  apiKey: process.env.MEM0AI_API_KEY,
  version: 'v1.1'
})

async function chat(query = '') {
  // search memories
const memories = await mem.search(query, { user_id: 'ayush' });

// ensure results exist
const memStr = (memories.results || []).map(e => e.memory).join('\n');


  const SYSTEM_PROMPT = `
    Context About User:
    ${memStr}
  `

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query }
    ]
  })

  console.log(`\n\n\nBot:`, response.choices[0].message.content)

  console.log('Adding to memory...')
  await mem.add(
    [
      { role: 'user', content: query },
      { role: 'assistant', content: response.choices[0].message.content }
    ],
    { user_id: 'ayush' }
  )
  console.log('Adding to memory done...')
}

chat('Suggest me some books?')
