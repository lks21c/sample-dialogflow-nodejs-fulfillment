'use strict';

/* Cloud Functions for Firebase library */
const functions = require('firebase-functions');

/* Google Assistant helper library */
const DialogflowApp = require('actions-on-google').DialogflowApp;

/* Constant to identify Google Assistant requests */
const googleAssistantRequest = 'google';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  /* An action is a string used to identify what needs to be done in fulfillment */
  let action = request.body.result.action;

  /* Parameters are any entites that Dialogflow has extracted from the request. */
  const parameters = request.body.result.parameters;

  /* Contexts are objects used to track and store conversation state */
  const inputContexts = request.body.result.contexts;

  /* Get the request source (Google Assistant, Slack, API, etc) and initialize DialogflowApp */
  const requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
  const app = new DialogflowApp({request: request, response: response});

  /* Create handlers for Dialogflow actions as well as a 'default' handler */
  const actionHandlers = {
    /* Default handler for unknown or undefined actions */
    'default': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(parameters);
      } else {
        sendDfResponse(parameters);
      }
    }
  };

  // If undefined or unknown action use the default handler
  if (!actionHandlers[action]) {
    action = 'default';
  }

  // Run the proper handler function to handle the request from Dialogflow
  actionHandlers[action]();

  // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
  function sendGoogleResponse (parameters) {
    console.log("parameters = " + JSON.stringify(parameters));

    if (parameters.cardType == '1') { /* Basic Card */
        app.ask(googleBasicCard(parameters));
    } else if (parameters.cardType == '2') { /* List */
        app.askWithList('Alright! Here are a few things you can learn. Which sounds interesting?',
            googleList(parameters)
        );
    } else if (parameters.cardType == '3') { /* carousel */
        app.askWithCarousel('Alright! Here are a few things you can learn. Which sounds interesting?',
            googleCarousel(parameters)
        );
    } else if (parameters.cardType == '4') { /* Suggestion Chip */
        app.ask(googleSuggestionChips(parameters));
    } else {
        app.ask(googleResponse(parameters));
    }
  }

  /* Function to send correctly formatted responses to Dialogflow which are then sent to the user */
  function sendDfResponse (parameters) {
    /* If the response to the user includes rich responses or contexts send them to Dialogflow */
    let responseJson = {};

    /* If speech or displayText is defined, use it to respond (if one isn't defined use the other's value) */
    responseJson.speech = "df speech";
    responseJson.displayText = "df text";

    /* Send response to Dialogflow */
    response.json(responseJson);
  }
});

/* Construct rich response for Google Assistant */
const app = new DialogflowApp();

function googleResponse(parameters) {
    return app.buildRichResponse().addSimpleResponse({
        speech: "speech",
        displayText: "text"
    });
}

function googleBasicCard(parameters) {
    // return app.buildRichResponse()
    //     .addSimpleResponse('이런 노래 어떨까요?')
    //     .addBasicCard(app.buildBasicCard('카드의 내용이 나오는 자리.')
    //         .setTitle('제목위치')
    //         .addButton('Read more', 'www.melon.com')
    //         .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', '이미지가 제대로 뜨지 않습니다.')
    //     );
    return app.buildRichResponse()
    // Create a basic card and add it to the rich response
        .addSimpleResponse('Math and prime numbers it is!')
        .addBasicCard(app.buildBasicCard('42 is an even composite number. It' +
            'is composed of three distinct prime numbers multiplied together. It' +
            'has a total of eight divisors. 42 is an abundant number, because the' +
            'sum of its proper divisors 54 is greater than itself. To count from' +
            '1 to 42 would take you about twenty-one…')
            .setTitle('Math & prime numbers')
            .addButton('Play Test', 'http://www.melon.com')
            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', 'Image alternate text')
        );
}

function googleList(parameters) {
    return app.buildList('Things to learn about')
        .addItems(app.buildOptionItem('MATH_AND_PRIME',
            ['math', 'math and prime', 'prime numbers', 'prime'])
            .setTitle('Math & prime numbers')
            .setDescription('42 is an abundant number because the sum of its ' +
                'proper divisors 54 is greater…')
            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', 'Math & prime numbers'))
        .addItems(app.buildOptionItem('EGYPT',
            ['religion', 'egpyt', 'ancient egyptian'])
            .setTitle('Ancient Egyptian religion')
            .setDescription('42 gods who ruled on the fate of the dead in the ' +
                'afterworld. Throughout the under…')
            .setImage('http://cdnimg.melon.co.kr/cm/album/images/026/46/282/2646282_500.jpg', 'Egypt')
        )
        .addItems(app.buildOptionItem('RECIPES',
            ['recipes', 'recipe', '42 recipes'])
            .setTitle('42 recipes with 42 ingredients')
            .setDescription('Here\'s a beautifully simple recipe that\'s full ' +
                'of flavor! All you need is some ginger and…')
            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/08/448/2208448_500.jpg', 'Recipe')
        );
}

function googleCarousel(parameters) {
    return app.buildCarousel()
        .addItems(app.buildOptionItem('MATH_AND_PRIME',
            ['math', 'math and prime', 'prime numbers', 'prime'])
            .setTitle('Math & prime numbers')
            .setDescription('42 is an abundant number because the sum of its ' +
                'proper divisors 54 is greater…')
            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', 'Math & prime numbers'))
        .addItems(app.buildOptionItem('EGYPT',
            ['religion', 'egpyt', 'ancient egyptian'])
            .setTitle('Ancient Egyptian religion')
            .setDescription('42 gods who ruled on the fate of the dead in the ' +
                'afterworld. Throughout the under…')
            .setImage('http://cdnimg.melon.co.kr/cm/album/images/026/46/282/2646282_500.jpg', 'Egypt')
        )
        .addItems(app.buildOptionItem('RECIPES',
            ['recipes', 'recipe', '42 recipes'])
            .setTitle('42 recipes with 42 ingredients')
            .setDescription('Here\'s a beautifully simple recipe that\'s full ' +
                'of flavor! All you need is some ginger and…')
            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/08/448/2208448_500.jpg', 'Recipe')
        );
}

function googleSuggestionChips() {
    return app.buildRichResponse()
        .addSimpleResponse({speech: 'Howdy! I can tell you fun facts about ' +
        'almost any number like 0, 42, or 100. What number do you have ' +
        'in mind?',
            displayText: 'Howdy! I can tell you fun facts about almost any ' +
            'number. What number do you have in mind?'})
        .addSuggestions(['0', '42', '100', 'Never mind'])
        .addSuggestionLink('Suggestion Link', 'https://assistant.google.com/');
}