# Homework 5
## 電腦視覺教育應用 - MS Cognitive Services Computer Vision API 

## 功能
- 辨識照片中的品牌，並且分析出顏色及主要色的色號。
- 經由網站互動讓學生思考配色在各大品牌的標誌運用，是否存在關聯性。

## 互動結果 
- 結果1
```
輸入圖片網址，左邊顯示偵測的結果(json格式)，右邊顯示偵測目標圖片及偵測品牌結果及顏色
```
![hw5-r1](https://github.com/Hsing-Tzu/LAT/blob/main/%E4%BD%9C%E6%A5%AD%E9%80%A3%E7%B5%90%E5%8D%80/Homework%205/Result1.png)
```
>成功偵測到可口可樂以及配色含有白色、紅色
```

- 結果2
```
上傳圖片檔案，左邊顯示偵測的結果(json格式)，右邊顯示偵測目標圖片及偵測品牌結果及顏色
```
![hw5-r2](https://github.com/Hsing-Tzu/LAT/blob/main/%E4%BD%9C%E6%A5%AD%E9%80%A3%E7%B5%90%E5%8D%80/Homework%205/Result2.png)
```
>成功偵測到百事可樂以及配色含有白色、紅色、藍色
```

- 結果3
```
輸入圖片網址，左邊顯示偵測的結果(json格式)，右邊顯示偵測目標圖片及偵測品牌結果及顏色
```
![hw5-r3](https://github.com/Hsing-Tzu/LAT/blob/main/%E4%BD%9C%E6%A5%AD%E9%80%A3%E7%B5%90%E5%8D%80/Homework%205/Result3.png)
```
>成功偵測到胡椒博士以及配色含有白色、紅色
```

### 綜合上述，可以發現可樂品牌標誌中皆包含白色、紅色，讓學生可以進一步探討原因，並且就各種主色之色號做深入比較。

## 程式碼說明
- 辨識功能程式--上傳圖片版
```
//確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v2.1/analyze";
//選擇API內所需的參數
    var params = {
        "visualFeatures": "Brands,Color",
        "details": "",
        "language": "en",
    };
//顯示分析的圖片
    var sourceImageUrl = URL.createObjectURL(imageObject);
    document.querySelector("#sourceImage").src = sourceImageUrl;
//送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        processData:false,
        contentType:false,
        // Request body
        data: imageObject
    })
```
- 辨識功能程式--圖片網址版
```
//確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v2.1/analyze";
//選擇API內所需的參數
    var params = {
        "visualFeatures": "Brands,Color",
        "details": "",
        "language": "en",
    };
//顯示分析的圖片
    var sourceImageUrl = document.getElementById("inputImage").value;
    document.querySelector("#sourceImage").src = sourceImageUrl;
//送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        // Request body
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })
```

- 顯示結果程式
```
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
//if條件判斷是否含有品牌
        if (data.brands && data.brands.length>0) {
            $("#picDescription").append("This image detects " + data.brands[0].name + " logo." + "<br>" + "It contains " + data.color.dominantColors + "." + "<br>" + "The accent color HEX is #" + data.color.accentColor + ".");
        } else{
            $("#picDescription").append("There are no brands detected in the image." + "<br>" + "It contains " + data.color.dominantColors + "." + "<br>" + "The accent color HEX is #" + data.color.accentColor + ".");
        }
    })
```
-連線錯誤程式
```
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
```
## 應用限制
- 只能偵測英文品牌
- 仍有偵測錯誤的情況
