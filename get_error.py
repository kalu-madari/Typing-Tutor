import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        
        try:
            await page.goto("http://localhost:5173", timeout=10000)
            await page.wait_for_timeout(2000) # Wait for dashboard
            
            # Click on Chapter 1 Lesson 1
            # Assuming there is a way to click it. 
            # I will just evaluate JS to set the store state to go to the lesson directly.
            # But the React app doesn't expose store globally.
            # Let's just click the first lesson button on screen.
            await page.click("text=The Index Fingers")
            await page.wait_for_timeout(2000)
            
        except Exception as e:
            errors.append(str(e))
            
        print("BROWSER ERRORS:")
        for err in errors:
            print("-", err)
            
        await browser.close()

asyncio.run(main())
