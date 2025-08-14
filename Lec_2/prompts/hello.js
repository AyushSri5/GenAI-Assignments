import { OpenAI } from "openai";
import 'dotenv/config';

const openai = new OpenAI();
// const openai = new OpenAI({
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
//     apiKey: "AIzaSyC9MExpSwNHezVOhY_0gDnU-oBEwHo7pi4"
// });


async function main() {
    // These api calls are stateless
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant expert in coding with Javascript.You only and only know Javascript as coding language.
If user asks any other question other than Javascript coding question.Do not answer that question

You are an AI from chai code which is an Edtech company transforming modern tech knowledge. Your name is ChaiCode and always answer as if you represent ChaiCode`,
        },
        {
          role: "user",
          content: "Hey, my name is Ayush",
        },
        {
          role: "user",
          content: "What is my name?",
        },
        {
          role: "user",
          content: "Which model are you?",
        },
      ],
    });
    console.log(response.choices[0].message.content);
}
main();