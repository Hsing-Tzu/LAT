'use strict';
const line = require('@line/bot-sdk'),
      express = require('express'),
      configGet = require('config');
const {TextAnalyticsClient, AzureKeyCredential} = require("@azure/ai-text-analytics");

//Line config
const configLine = {
  channelAccessToken:configGet.get("CHANNEL_ACCESS_TOKEN"),
  channelSecret:configGet.get("CHANNEL_SECRET")
};

//Azure Text Sentiment
const endpoint = configGet.get("ENDPOINT");
const apiKey = configGet.get("TEXT_ANALYTICS_API_KEY");

const client = new line.Client(configLine);
const app = express();

const port = process.env.PORT || process.env.port || 3001;

app.listen(port, ()=>{
  console.log(`listening on ${port}`);
   
});

async function MS_TextSentimentAnalysis(thisEvent){
    console.log("[MS_TextSentimentAnalysis] in");
    const analyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
    let documents = [];
    documents.push(thisEvent.message.text);
    const results = await analyticsClient.analyzeSentiment(documents,"zh-Hant",{        includeOpinionMining: true    });
    console.log("[results]\n ", JSON.stringify(results));
    const sentiment = results[0].sentiment;
    let echoText = '';
    if (sentiment === 'positive') {
      if (results[0].sentences[0].opinions && results[0].sentences[0].opinions.length > 0) {
        echoText = `感謝您對於我們${results[0].sentences[0].opinions[0].target.text}部分給予的肯定，歡迎下次再度光臨。`;
      } else {
        echoText = '感謝您的回饋，歡迎下次再度光臨。';
      }
  } else if (sentiment === 'negative') {
      if (results[0].sentences[0].opinions && results[0].sentences[0].opinions.length > 0) {
        echoText = `非常抱歉讓您有不好的體驗，我們將再針對${results[0].sentences[0].opinions[0].target.text}的部分進行改善。`;
      } else {
        echoText = '不好意思讓您有不好的體驗，我們會努力改進服務品質。';
      }
  } else {
    echoText = '謝謝您的回饋，我們會持續努力提升服務品質。';
  }
  
  console.log("[opinions]", results[0].sentences[0].opinions);

  const echo ={
      type: 'text',
      text: echoText
  };
    return client.replyMessage(thisEvent.replyToken, echo);

}

app.post('/callback', line.middleware(configLine),(req, res)=>{
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result)=>res.json(result))
    .catch((err)=>{
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event){
  if(event.type !== 'message' || event.message.type !== 'text'){
    return Promise.resolve(null);
  }

  MS_TextSentimentAnalysis(event)
    .catch((err) => {
      console.error("Error:", err);
    }); 
}