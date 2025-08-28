import { Agent, run, tool } from "@openai/agents";
import 'dotenv/config';
import z from "zod";
import {RECOMMENDED_PROMPT_PREFIX} from '@openai/agents-core/extensions'

const getCurrentTime = tool({
    name: "get_current_time",
    description: "This tool returns the current time.",
    parameters: z.object({
    }),
    async execute() {
        return new Date().toString();
    }
 })

 const getMenuTool = tool({
    name: "get_menu",
    description: "Fetches and returns the menu items",
    parameters: z.object({}),
    async execute() {
        return {
      Drinks: {
        Chai: 'INR 50',
        Coffee: 'INR 70',
      },
      Veg: {
        DalMakhni: 'INR 250',
        Panner: 'INR 400',
      },
    };
    }
 })

const cookingAgent = new Agent({
    name: "Cooking Agent",
    model: "gpt-4.1-mini",
    tools: [getCurrentTime,getMenuTool],
    instructions: `You are a helpful cooking assistant who is specialized in cooking food.
    You help the users with food options and recipes and help them cook food. 
    
    `,
    
});

const codingAgent = new Agent({
    name: "Coding Agent",
    instructions: `You are an expert coding assistant particularly in JavaScript.`
    // tools: [cookingAgent.asTool()]
});

const gatewayAgent = Agent.create({
    name: 'Triage Agent',
  instructions: `
  ${RECOMMENDED_PROMPT_PREFIX}
  You are
  
  `,
  handoffs: [codingAgent,cookingAgent]
})

async function main(query){
    const result = await run(gatewayAgent,query);
    console.log("History: ", result.history);
    console.log("Hand off too",result.lastAgent.name);
    
    console.log("Final Result: ", result.finalOutput);
    
}

main("Recipe of a cake and javascript code to add two numbers");