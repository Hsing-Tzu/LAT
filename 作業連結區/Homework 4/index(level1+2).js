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
    const results = await analyticsClient.analyzeSentiment(documents);
    console.log("[results]\n ", JSON.stringify(results));

    let echoText = '';
    if (results[0].sentiment == 'positive'){
      echoText = '正向' + ' 信心指數:' + results[0].confidenceScores.positive;
    }
    else if(results[0].sentiment == 'neutral'){
      echoText = '中性' + ' 信心指數:' + results[0].confidenceScores.neutral;
    }
    else{
      echoText = '負向' + ' 信心指數:' + results[0].confidenceScores.negative;
    }

    const echo = {
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