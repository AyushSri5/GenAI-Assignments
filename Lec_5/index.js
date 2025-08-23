import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config';

const model = new ChatOpenAI({
    model: "gpt-4o-mini"
});

async function createChaiCodeAgent(){
    const llm = new ChatOpenAI({
    model: "gpt-4o-mini"
});


}


async function callOpenAI(state){
    console.log(`Inside callOpenAI with state:`, state);

    const response = await model.invoke(state.messages);

    return {
        messages: [response],
    }
    
}

const workflow = new StateGraph(MessagesAnnotation)
.addNode('callOpenAI', callOpenAI)
// .addNode('runAfterOpenAI', runAfterOpenAI)
.addEdge('__start__', 'callOpenAI')
// .addEdge('callOpenAI','runAfterOpenAI')
.addEdge('callOpenAI', '__end__');

const graph = workflow.compile();

async function runGraph(){
    const userQuery = 'Hey, What is 2+2?';


    const updatedState = await graph.invoke({messages: [new HumanMessage(userQuery)]});
    console.log('State after graph invocation:', updatedState);
    
}

// async function runAfterOpenAI(state){
//     console.log(`Inside runAfterOpenAI with state:`, state);

//     return {
//         messages: ['Hey, I just added something to the state after OpenAI call!'],
//     }
    
// }

runGraph();