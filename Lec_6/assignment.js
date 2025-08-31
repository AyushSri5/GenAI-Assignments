import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import { chromium } from 'playwright';

// ---------- Browser Setup ----------
const browser = await chromium.launch({
  headless: false,
  chromiumSandbox: true,
  env: {},
  args: ['--disable-extensions', '--disable-file-system'],
});
const page = await browser.newPage();

// Set viewport for better visibility
await page.setViewportSize({ width: 1280, height: 720 });

const takeScreenShot = tool({
  name: 'take_screenshot',
  description: 'Take a screenshot of the current page and return base64 string. Use sparingly to avoid token limits.',
  parameters: z.object({}),
  async execute() {
    const buffer = await page.screenshot({ fullPage: false });
    return buffer.toString('base64');
  },
});

const openURL = tool({
  name: 'open_url',
  description: 'Open a URL in the browser',
  parameters: z.object({
    url: z.string().describe('The URL to open'),
  }),
  async execute({ url }) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 300 });
    await page.waitForTimeout(2000);
    return `Opened URL: ${url}`;
  },
});

const fillField = tool({
  name: 'fill_field',
  description: 'Fill a single input field with very slow, deliberate typing to prevent character mixing.',
  parameters: z.object({
    selector: z.string().describe('CSS selector for the input field'),
    text: z.string().describe('Text to fill'),
    fieldName: z.string().describe('Name of the field for logging'),
  }),
  async execute({ selector, text, fieldName }) {
    try {
      console.log(`Filling ${fieldName} (${selector}) with "${text}"`);
      
      
      await page.waitForSelector(selector, { timeout: 15000 });
      await page.waitForTimeout(1000);
      
    
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      
      await page.click(selector);
      await page.waitForTimeout(500);
      await page.click(selector);
      await page.waitForTimeout(1000);
      
      
      await page.keyboard.press('Control+A');
      await page.waitForTimeout(300);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(500);
      
      
      let currentValue = await page.inputValue(selector);
      if (currentValue !== '') {
        await page.fill(selector, '');
        await page.waitForTimeout(500);
      }
      
      // Type very slowly character by character
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        await page.keyboard.type(char);
        await page.waitForTimeout(300); 
        
        
        const partialValue = await page.inputValue(selector);
        console.log(`After typing "${char}": field has "${partialValue}"`);
        
        
        if (!partialValue.endsWith(char)) {
          console.log(`Character "${char}" not typed correctly, retrying...`);
          await page.keyboard.press('Backspace');
          await page.waitForTimeout(200);
          await page.keyboard.type(char);
          await page.waitForTimeout(300);
        }
      }
      
      
      await page.waitForTimeout(1000);
      const finalValue = await page.inputValue(selector);
      const success = finalValue === text;
      
      console.log(`${fieldName} FINAL: expected "${text}", got "${finalValue}", success: ${success}`);
      
      // If still not correct, try one more time with fill method
      if (!success) {
        console.log(`Final attempt using fill method for ${fieldName}`);
        await page.click(selector);
        await page.waitForTimeout(500);
        await page.fill(selector, text);
        await page.waitForTimeout(1000);
        
        const retryValue = await page.inputValue(selector);
        return `${fieldName}: FINAL ATTEMPT - "${retryValue}" (expected: "${text}")`;
      }
      
      return `${fieldName}: SUCCESS - "${finalValue}"`;
      
    } catch (error) {
      console.log(`Error filling ${fieldName}: ${error.message}`);
      return `ERROR filling ${fieldName}: ${error.message}`;
    }
  },
});

const checkAllFields = tool({
  name: 'check_all_fields',
  description: 'Check the current values of all form fields',
  parameters: z.object({}),
  async execute() {
    try {
      const fields = {
        firstName: await page.inputValue('#firstName').catch(() => 'ERROR'),
        lastName: await page.inputValue('#lastName').catch(() => 'ERROR'),
        email: await page.inputValue('#email').catch(() => 'ERROR'),
        password: await page.inputValue('#password').catch(() => 'ERROR'),
        confirmPassword: await page.inputValue('#confirmPassword').catch(() => 'ERROR'),
      };
      
      return `Current field values:
- First Name: "${fields.firstName}"
- Last Name: "${fields.lastName}"
- Email: "${fields.email}"
- Password: "${fields.password}"
- Confirm Password: "${fields.confirmPassword}"`;
    } catch (error) {
      return `Error checking fields: ${error.message}`;
    }
  },
});

const clickElement = tool({
  name: 'click_element',
  description: 'Click a button or element using a CSS selector',
  parameters: z.object({
    selector: z.string().describe('CSS selector for the element to click'),
  }),
  async execute({ selector }) {
    try {
      await page.waitForSelector(selector, { timeout: 10000 });
      await page.click(selector);
      // Wait for any navigation or form submission
      await page.waitForTimeout(2000);
      return `Successfully clicked ${selector}`;
    } catch (error) {
      return `Failed to click ${selector}: ${error.message}`;
    }
  },
});

const getPageInfo = tool({
  name: 'get_page_info',
  description: 'Get information about the current page including URL, title, and visible form fields',
  parameters: z.object({}),
  async execute() {
    const url = page.url();
    const title = await page.title();
    
    // Get all visible input fields and their attributes
    const inputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[name]'));
      return inputs.map(input => ({
        name: input.name,
        placeholder: input.placeholder,
        type: input.type,
        id: input.id,
        className: input.className,
      })).filter(input => input.name || input.placeholder || input.id);
    });

    // Get all buttons
    const buttons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], .btn, [role="button"]'));
      return buttons.map(btn => ({
        text: btn.textContent?.trim(),
        type: btn.type,
        className: btn.className,
        id: btn.id,
      })).filter(btn => btn.text);
    });

    return {
      url,
      title,
      inputs: inputs.slice(0, 10), // Limit to avoid token usage
      buttons: buttons.slice(0, 5),
    };
  },
});

// ---------- Agent ----------
const websiteAutomationAgent = new Agent({
  name: 'Signup Automation Agent',
  model: 'gpt-3.5-turbo', // Use cheaper model to avoid rate limits
  instructions: `
  You are a website automation agent. Work efficiently but with proper timing.

  CRITICAL TIMING RULES:
  - Use EXTREMELY SLOW typing (300ms between each character)
  - Wait 3-4 seconds between filling each field
  - Always verify each field is completely filled before moving to next
  - Clear fields thoroughly before typing
  
  PROCESS:
  1. Open the URL  
  2. Fill each field very slowly with long pauses
  3. Check all fields at the end
  4. Submit the form
  
  SELECTORS (use exact field names):
  - First Name: #firstName → "Ayush" 
  - Last Name: #lastName → "Srivastava"  
  - Email: #email → "test@example.com"
  - Password: #password → "mypassword123"
  - Confirm Password: #confirmPassword → "mypassword123"
  - Submit: button[type="submit"]
  `,
  tools: [openURL, fillField, checkAllFields, clickElement],
});

// ---------- Run ----------
try {
  console.log('Starting automation...');
  
  const response = await run(websiteAutomationAgent, [
    {
      role: 'user',
      content: `
      Fill the signup form with VERY SLOW typing to prevent character mixing:
      
      1. Go to https://ui.chaicode.com/auth/signup
      2. Fill #firstName with "Ayush" (fieldName: "firstName") - type very slowly
      3. Wait 4 seconds, then fill #lastName with "Srivastava" (fieldName: "lastName") 
      4. Wait 4 seconds, then fill #email with "test@example.com" (fieldName: "email")
      5. Wait 4 seconds, then fill #password with "mypassword123" (fieldName: "password")
      6. Wait 4 seconds, then fill #confirmPassword with "mypassword123" (fieldName: "confirmPassword")
      7. Check all fields are correct
      8. Submit the form
      
      CRITICAL: The fill_field tool now types each character with 300ms delay. 
      Wait 4+ seconds between fields to prevent any mixing.
      `,
    },
  ]);

  console.log('Automation completed successfully!');
  console.log('Final response:', response);
  
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    console.error('Rate limit exceeded. Please wait a few minutes and try again.');
    console.error('Consider using a smaller model like gpt-3.5-turbo in your OpenAI configuration.');
  } else {
    console.error('Error during automation:', error.message);
  }
} finally {
  // Keep browser open for a moment to see results
  console.log('Keeping browser open for 10 seconds to see results...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  await browser.close();
}