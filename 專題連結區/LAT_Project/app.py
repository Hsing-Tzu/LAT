from flask import Flask, render_template, request
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

app = Flask(__name__)

# Azure Text Analytics API credentials
endpoint = ''
api_key = ''

def analyze_sentiment(text):
    client = TextAnalyticsClient(endpoint=endpoint, credential=AzureKeyCredential(api_key))
    document = [text]
    result = client.analyze_sentiment(documents=document)[0]
    sentiment = result.sentiment
    confidence = get_sentiment_confidence(result.confidence_scores)
    return sentiment, confidence

def get_sentiment_confidence(scores):
    return {
        'positive': scores.positive,
        'neutral': scores.neutral,
        'negative': scores.negative
    }

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_comments():
    video_url = request.form['video_url']
    max_comments = 500
    count = 0  # Initialize the comment counter

    # Start the browser
    driver = webdriver.Chrome()
    
    # Go to the video page
    driver.get(video_url)
    
    # Wait for the video page to load
    time.sleep(5)
    
    # Get the video title
    video_title = driver.find_element(By.XPATH, '//h1[@class="title style-scope ytd-video-primary-info-renderer"]').text
    
    # Scroll to the middle of the page
    middle_height = driver.execute_script("return window.innerHeight")/2
    driver.execute_script(f"window.scrollTo(0, {middle_height});")
    
    # Wait for the page to update
    time.sleep(5)
    
    # Scroll to the bottom of the page
    last_height = driver.execute_script("return document.documentElement.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
        time.sleep(10)
        new_height = driver.execute_script("return document.documentElement.scrollHeight")
        if new_height == last_height or count >= max_comments:
            break  # Stop scrolling if reached the bottom of the page or max_comments
        last_height = new_height
    
    # Get the comment elements
    comments = driver.find_elements(By.XPATH, "//ytd-comment-renderer[@class='style-scope ytd-comment-thread-renderer']")
    
    # Extract comments and analyze sentiment
    comment_list = []
    for comment in comments:
        try:
            author_element = comment.find_element(By.XPATH, ".//a[@id='author-text']")
            author = author_element.text
            comment_element = comment.find_element(By.XPATH, ".//yt-formatted-string[@class='style-scope ytd-comment-renderer']")
            comment_text = comment_element.text
            sentiment, confidence = analyze_sentiment(comment_text)
            comment_list.append({
                "author": author,
                "comment": comment_text,
                "sentiment": sentiment,
                "confidence": confidence
            })
            count += 1  # Increment the comment counter
        except:
            pass
        
        if count >= max_comments:
            break  # Stop scraping if reached max_comments
    
    # Save comments and sentiment analysis results to a CSV file
    df = pd.DataFrame(comment_list)
    df.to_csv(f"{video_title}_comments.csv", index=False)
    
    # Close the browser
    driver.quit()
    
    return render_template('result.html', comments=comment_list)

if __name__ == '__main__':
    app.run()
