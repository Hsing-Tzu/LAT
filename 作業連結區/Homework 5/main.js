$(document).ready(function(){
    //do something
    $("#thisButton").click(function(){
        processImage();
    });
    $("#inputImageFile").change(function(e){
        processImageFile(e.target.files[0]);
    });
});

function processImageFile(imageObject) {

    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v2.1/analyze";

    var params = {
        //"visualFeatures": "Faces,Objects,Adult,Brands,Categories,Description",
        "visualFeatures": "Brands,Color",

        "details": "",
        //"maxCandidates": "10",
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
        .done(function (data) {
            //顯示JSON內容
            $("#responseTextArea").val(JSON.stringify(data, null, 2));
            $("#picDescription").empty();
            if (data.brands && data.brands.length>0) {
                $("#picDescription").append("This image detects " + data.brands[0].name + " logo." + "<br>" + "It contains " + data.color.dominantColors + "." + "<br>" + "The accent color HEX is #" + data.color.accentColor + ".");
            } else{
                $("#picDescription").append("There are no brands detected in the image." + "<br>" + "It contains " + data.color.dominantColors + "." + "<br>" + "The accent color HEX is #" + data.color.accentColor + ".");
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            //丟出錯誤訊息
            var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
            alert(errorString);
        });
};


function processImage() {
    
    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v2.1/analyze";
    
    var params = {
        // "visualFeatures": "Faces,Objects,Adult,Brands,Categories,Description",
        "visualFeatures": "Brands,Color",
        "details": "",
        //"maxCandidates":"10",
        "language": "zh",
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
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
        if (data.brands && data.brands.length>0) {
            $("#picDescription").append("This image detects " + data.brands[0].name + " logo." + "<br>" + "It contains " + data.color.dominantColors + "." + "<br>" + "The accent color HEX is #" + data.color.accentColor + ".");
        } else{
            $("#picDescription").append("There are no brands detected in the image." + "<br>" + "It contains " + data.color.dominantColors + "." + "<br>" + "The accent color HEX is #" + data.color.accentColor + ".");
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};