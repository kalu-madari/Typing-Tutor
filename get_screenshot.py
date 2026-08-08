import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        try:
            await page.goto("http://localhost:5173", timeout=10000)
            await page.wait_for_timeout(2000)
            
            # Find and click the "Continue" button on the dashboard
            await page.click("#continue-btn")
            await page.wait_for_timeout(9000)
            
            await page.screenshot(path="screenshot3.png")
            print("Screenshot saved to screenshot3.png")
        except Exception as e:
            print("Exception:", e)
            
        await browser.close()

asyncio.run(main())
