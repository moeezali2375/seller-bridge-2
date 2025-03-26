from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import time
import random
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from typing import List

app = FastAPI()


class ASINRequest(BaseModel):
    asins: List[str]


@app.post("/scrape_amazon/")
async def scrape_amazon(request: ASINRequest):
    asins = request.asins

    # Set up Chrome with anti-bot options
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    )

    # Initialize Selenium WebDriver
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )

    product_data = []

    for asin in asins:
        url = f"https://www.amazon.com/dp/{asin}"
        print(url)
        driver.get(url)

        # Random delay to avoid bot detection
        time.sleep(random.uniform(1, 3))

        # GET TITLE
        try:
            title = (
                WebDriverWait(driver, 5)
                .until(EC.presence_of_element_located((By.ID, "productTitle")))
                .text.strip()
            )
        except:
            title = "Not Found"

        print(f"ASIN: {asin}, Title: {title}")

        # GET BUYBOX PRICE
        try:
            # Try to get the Buy Box price
            price_box = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "a-box-group"))
            )

            try:
                price_whole = price_box.find_element(
                    By.CLASS_NAME, "a-price-whole"
                ).text.strip()
            except:
                price_whole = ""

            try:
                price_fraction = price_box.find_element(
                    By.CLASS_NAME, "a-price-fraction"
                ).text.strip()
            except:
                price_fraction = ""

            if price_whole and price_fraction:
                price = f"{price_whole}.{price_fraction}"
            elif price_whole:
                price = price_whole
            else:
                price = "Not Found"

        except:
            # If Buy Box price is not found, check alternative offers
            try:
                offer_list = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(
                        (By.CLASS_NAME, "all-offers-display")
                    )
                )

                first_offer = offer_list.find_element(By.ID, "aod-offer")

                try:
                    price_whole = first_offer.find_element(
                        By.CLASS_NAME, "a-price-whole"
                    ).text.strip()
                except:
                    price_whole = ""

                try:
                    price_fraction = first_offer.find_element(
                        By.CLASS_NAME, "a-price-fraction"
                    ).text.strip()
                except:
                    price_fraction = ""

                if price_whole and price_fraction:
                    price = f"{price_whole}.{price_fraction}"
                elif price_whole:
                    price = price_whole
                else:
                    price = "Price Not Found in first offer"

            except:
                price = "No Alternative Offers Found"

        print("Final Price:", price)

        product_data.append({"ASIN": asin, "Title": title, "Price": price})

    driver.quit()
    return product_data
