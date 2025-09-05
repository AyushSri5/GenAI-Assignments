import { RealtimeSession } from "@openai/agents/realtime";
import axios from "axios"

export async function GET(){
    //Ephiermal key, do not use in production
    const response = await axios.post("https://api.openai.com/v1/realtime/sessions",{
        model: "gpt-4o-realtime-preview",
        modalities: ['audio','text']
    },{
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }
    });

    
    return Response.json({tempApiKey: response.data.client_secret.value});
}