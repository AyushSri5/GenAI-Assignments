import { Agent, run, tool } from "@openai/agents";
import 'dotenv/config';

let thread = [];

const customerSupportAgent = new Agent({
    name: "Customer Support Agent",
    instructions: `
    You are an helpful customer support agent.
    `
})

async function main(query){
    const result = await run(customerSupportAgent,
        thread.concat({ role: 'user', content: query }),
    );
    thread = result.history;
    console.log("Thread: ", thread);
    
    console.log("Result: ", result.finalOutput);
    
}
main("My name is Ayush").then(() => {
    main('What is my name?');

})