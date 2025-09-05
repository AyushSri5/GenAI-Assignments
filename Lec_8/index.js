import 'dotenv/config'


import { Memory } from 'mem0ai/oss'
import { OpenAI } from 'openai'

const client = new OpenAI();
const config = {
  vectorStore: {
    provider: 'qdrant',
    config: {
      collectionName: 'memories',
      embeddingModelDims: 1536,
      host: 'localhost',
      port: 6333,
    },
  },
  llm: {
    provider: 'openai',
    config: {
      model: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
    },
  },
  embedder: {
    provider: 'openai',
    config: {
      model: 'text-embedding-ada-002',
      apiKey: process.env.OPENAI_API_KEY,
    },
  },
};

const memory = new Memory(config);

// mem.add([{role: 'user',content: 'My name is Ayush'}],{
//     userId: 'ayush'
// });

async function main(query = ''){
   const memories = await mem.search(query, { userId: 'ayush' });
  const memStr = memories.results.map((e) => e.memory).join('\n');

  const SYSTEM_PROMPT = `
    Context About User:
    ${memStr}
  `;

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query },
    ],
  });

  console.log(`\n\n\nBot:`, response.choices[0].message.content);
  console.log('Adding to memory...');
  await mem.add(
    [
      { role: 'user', content: query },
      { role: 'assistant', content: response.choices[0].message.content },
    ],
    { userId: 'ayush' } // DB
  );
  console.log('Adding to memory done...');
}

main('Hey Agent,My name is Muskan and i am from Varanasi?');