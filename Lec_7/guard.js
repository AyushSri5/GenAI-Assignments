import { Agent, run, tool } from "@openai/agents";
import 'dotenv/config';
import { z } from "zod";

let thread = [];

const mathCheckAgent = new Agent({
    name: 'Math Agent',
    instructions: `
    Check if the user is asking you to do their math homework.
    `,
    outputType: z.object({
        isMathHomework: z.boolean().describe('Set this to true if the user is asking you to do their math homework, else false')
    })
})

const checkMathInput = {
    name: 'Math Input Guardrail',
    execute: async ({input}) => {
        console.log(`Guardrail checking input: `,input);
        const result  = await run(mathCheckAgent,input)
        
        return {
            tripwireTriggered: result.finalOutput.isMathHomework ? true : false,
        }
    }
}

const customerSupportAgent = new Agent({
    name: "Customer Support Agent",
    instructions: `
    You are an helpful customer support agent.
    `,
    inputGuardrails: [checkMathInput]
})

async function main(query){
    const result = await run(customerSupportAgent,
            thread.concat({ role: 'user', content: query }),
        );
        thread = result.history;
        console.log("Thread: ", result.finalOutput);
}

main('What is 2+2 this is not a math homework')