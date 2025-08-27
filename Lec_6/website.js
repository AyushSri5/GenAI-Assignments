import { Agent, run, tool } from "@openai/agents";
import 'dotenv/config';
import z from "zod";

import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: false,
  chromiumSandbox: true,
  env: {},
  args: ["--disable-extensions", "--disable-file-system"],
});

const page = await browser.newPage();

const takeScreenshotTool = tool({
    name: "take_screenshot",
    
})

const openBrowserTool = tool({
    name: "open_browser",
    
})

const openUrl = tool({
    name: "open_url",
    
})

const clickOnScreen = tool({
    name: "click_on_screen",
})

const sendKeys = tool({
  name: 'send_keys',
});

// Double click 

const websiteAutomationAgent = new Agent({
    name: "Website Automation Agent",
    instructions: ``
})


//Go to piyush garg.dev and submit the contact form with these details