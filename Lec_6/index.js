import { Agent, run, tool } from "@openai/agents";
import 'dotenv/config';
import z from "zod";

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
    instructions: `You are an expert coding assistant particularly in JavaScript.`,
    tools: [cookingAgent.asTool()]
});

const gatewayAgent = Agent.create({
    name: 'Triage Agent',
  instructions: `
  You determine which agent to use

   Please use food related queries handoff to cookingAgent
   and for coding to codingAgent.
  
  `,
  handoffs: [codingAgent,cookingAgent]
})

async function main(query){
    const result = await run(gatewayAgent,query);
    console.log("History: ", result.history);
    
    console.log("Final Result: ", result.finalOutput);
    
}

main("Depending on current time, what are some good food options for me also what all items are available in menu for me?");