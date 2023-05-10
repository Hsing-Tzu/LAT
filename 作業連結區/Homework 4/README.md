# Homework 4
## 情感分析機器人
***

## 作業要求
### 3 個 Level
- Level 1: 直接辨識訊息內容為 positive/negetive/netural
- Level 2: 將系統標籤改成中文(正向/負向/中性)，並顯示信心指數
- Level 3: 針對評論主詞套入回覆訊息

## 互動結果 
- Level 1 + 2

![hw4-1+2](/path/to/Level1+2.jpg)
```
 > 結果變成中文，並附上信心指數
```
- Level 3

![hw4-3](/path/to/Level3.jpg)

```
 > 針對主詞進行評價回覆
```

## 程式碼說明
### Level 1 + 2
###   > 改變標籤: results[0].sentiment == '(英文標籤)' ，並運用if判斷情緒，給出相應的信心指數
```
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
```

### Level 3
###   > 運用if判斷情緒，給出相應的評價回覆，並加上抓取主詞，使回應更加具體

```
async function MS_TextSentimentAnalysis(thisEvent){
    console.log("[MS_TextSentimentAnalysis] in");
    const analyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
    let documents = [];
    documents.push(thisEvent.message.text);
    const results = await analyticsClient.analyzeSentiment(documents,"zh-Hant",{
                includeOpinionMining: true
                });
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
```