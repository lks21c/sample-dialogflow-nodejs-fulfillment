'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library

const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  // An action is a string used to identify what needs to be done in fulfillment
  let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters

  // Parameters are any entites that Dialogflow has extracted from the request.
  const parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters

  // Contexts are objects used to track and store conversation state
  const inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts

  // Get the request source (Google Assistant, Slack, API, etc) and initialize DialogflowApp
  const requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
  const app = new DialogflowApp({request: request, response: response});

  // Create handlers for Dialogflow actions as well as a 'default' handler
  const actionHandlers = {
    // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
    'input.welcome': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
      } else {
        sendResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
      }
    },
    // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
    'input.unknown': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
      } else {
        sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
      }
    },
    // Default handler for unknown or undefined actions
    'default': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        let responseToUser = {
          //googleRichResponse: googleRichResponse, // Optional, uncomment to enable
          //googleOutputContexts: ['weather', 2, { ['city']: 'rome' }], // Optional, uncomment to enable
          speech: '이것이 스피치죠', // spoken response
          displayText: '이건 DP용 text' // displayed response
        };
        sendGoogleResponse(responseToUser);
      } else {
        let responseToUser = {
          //richResponses: richResponses, // Optional, uncomment to enable
          //outputContexts: [{'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}}], // Optional, uncomment to enable
          speech: 'yaho editor', // spoken response
          displayText: 'yaho dp editor' // displayed response
        };
        sendResponse(responseToUser);
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
  function sendGoogleResponse (responseToUser) {
    if (typeof responseToUser === 'string') {
      app.ask(responseToUser); // Google Assistant response
    } else {
      // If speech or displayText is defined use it to respond
      let googleResponse = app.buildRichResponse().addSimpleResponse({
        speech: responseToUser.speech || responseToUser.displayText,
        displayText: responseToUser.displayText || responseToUser.speech
      });

      // Optional: Overwrite previous response with rich response
      if (responseToUser.googleRichResponse) {
        googleResponse = responseToUser.googleRichResponse;
      }

      // Optional: add contexts (https://dialogflow.com/docs/contexts)
      if (responseToUser.googleOutputContexts) {
        app.setContext(...responseToUser.googleOutputContexts);
      }

      //app.ask(googleResponse); // Send response to Dialogflow and Google Assistant

        console.log("param = " + parameters.cardType);

      console.log('response body: ' + JSON.stringify(app.buildRichResponse()
        // Create a basic card and add it to the rich response
        .addSimpleResponse('이런 노래 어떨까요?')
        .addBasicCard(app.buildBasicCard('카드의 내용이 나오는 자리.')
          .setTitle('제목위치')
          .addButton('Read more', 'www.melon.com')
          .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', '이미지가 제대로 뜨지 않습니다.')
        )));

            if (parameters.cardType == '1') {
                app.ask(app.buildRichResponse()
                    // Create a basic card and add it to the rich response
                        .addSimpleResponse('이런 노래 어떨까요?' + parameters.cardType)
                        .addBasicCard(app.buildBasicCard('카드의 내용이 나오는 자리.')
                            .setTitle('제목위치')
                            .addButton('Read more', 'www.melon.com')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', '이미지가 제대로 뜨지 않습니다.')
                        )
                );
            } else if (parameters.cardType == '2') {
                app.askWithList('Alright! Here are a few things you can learn. Which sounds interesting?',
                    // Build a list
                    app.buildList('Things to learn about')
                    // Add the first item to the list
                        .addItems(app.buildOptionItem('MATH_AND_PRIME',
                            ['math', 'math and prime', 'prime numbers', 'prime'])
                            .setTitle('Math & prime numbers')
                            .setDescription('42 is an abundant number because the sum of its ' +
                                'proper divisors 54 is greater…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', 'Math & prime numbers'))
                        // Add the second item to the list
                        .addItems(app.buildOptionItem('EGYPT',
                            ['religion', 'egpyt', 'ancient egyptian'])
                            .setTitle('Ancient Egyptian religion')
                            .setDescription('42 gods who ruled on the fate of the dead in the ' +
                                'afterworld. Throughout the under…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/026/46/282/2646282_500.jpg', 'Egypt')
                        )
                        // Add third item to the list
                        .addItems(app.buildOptionItem('RECIPES',
                            ['recipes', 'recipe', '42 recipes'])
                            .setTitle('42 recipes with 42 ingredients')
                            .setDescription('Here\'s a beautifully simple recipe that\'s full ' +
                                'of flavor! All you need is some ginger and…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/08/448/2208448_500.jpg', 'Recipe')
                        )
                );
            } else if (parameters.cardType == '3') {
                app.askWithList('Alright! Here are a few things you can learn. Which sounds interesting?',
                    // Build a list
                    app.buildList('Things to learn about')
                    // Add the first item to the list
                        .addItems(app.buildOptionItem('MATH_AND_PRIME',
                            ['math', 'math and prime', 'prime numbers', 'prime'])
                            .setTitle('Math & prime numbers')
                            .setDescription('42 is an abundant number because the sum of its ' +
                                'proper divisors 54 is greater…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', 'Math & prime numbers'))
                        // Add the second item to the list
                        .addItems(app.buildOptionItem('EGYPT',
                            ['religion', 'egpyt', 'ancient egyptian'])
                            .setTitle('Ancient Egyptian religion')
                            .setDescription('42 gods who ruled on the fate of the dead in the ' +
                                'afterworld. Throughout the under…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/026/46/282/2646282_500.jpg', 'Egypt')
                        )
                        // Add third item to the list
                        .addItems(app.buildOptionItem('RECIPES',
                            ['recipes', 'recipe', '42 recipes'])
                            .setTitle('42 recipes with 42 ingredients')
                            .setDescription('Here\'s a beautifully simple recipe that\'s full ' +
                                'of flavor! All you need is some ginger and…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/08/448/2208448_500.jpg', 'Recipe')
                        )
                );
            } else if (parameters.cardType == '4') {
                app.askWithCarousel('Alright! Here are a few things you can learn. Which sounds interesting?',
                    // Build a carousel
                    app.buildCarousel()
                    // Add the first item to the carousel
                        .addItems(app.buildOptionItem('MATH_AND_PRIME',
                            ['math', 'math and prime', 'prime numbers', 'prime'])
                            .setTitle('Math & prime numbers')
                            .setDescription('42 is an abundant number because the sum of its ' +
                                'proper divisors 54 is greater…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/56/290/2256290_500.jpg', 'Math & prime numbers'))
                        // Add the second item to the carousel
                        .addItems(app.buildOptionItem('EGYPT',
                            ['religion', 'egpyt', 'ancient egyptian'])
                            .setTitle('Ancient Egyptian religion')
                            .setDescription('42 gods who ruled on the fate of the dead in the ' +
                                'afterworld. Throughout the under…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/026/46/282/2646282_500.jpg', 'Egypt')
                        )
                        // Add third item to the carousel
                        .addItems(app.buildOptionItem('RECIPES',
                            ['recipes', 'recipe', '42 recipes'])
                            .setTitle('42 recipes with 42 ingredients')
                            .setDescription('Here\'s a beautifully simple recipe that\'s full ' +
                                'of flavor! All you need is some ginger and…')
                            .setImage('http://cdnimg.melon.co.kr/cm/album/images/022/08/448/2208448_500.jpg', 'Recipe')
                        )
                );
            } else if (parameters.cardType == '5') {
                app.ask(app.buildRichResponse()
                    .addSimpleResponse({speech: 'Howdy! I can tell you fun facts about ' +
                    'almost any number like 0, 42, or 100. What number do you have ' +
                    'in mind?',
                        displayText: 'Howdy! I can tell you fun facts about almost any ' +
                        'number. What number do you have in mind?'})
                    .addSuggestions(['0', '42', '100', 'Never mind'])
                    .addSuggestionLink('Suggestion Link', 'https://assistant.google.com/')
                );
            } else {
                app.ask(googleResponse);
            }
    }
  }

  // Function to send correctly formatted responses to Dialogflow which are then sent to the user
  function sendResponse (responseToUser) {
    // if the response is a string send it as a response to the user
    if (typeof responseToUser === 'string') {
      let responseJson = {};
      responseJson.speech = responseToUser; // spoken response
      responseJson.displayText = responseToUser; // displayed response
      response.json(responseJson); // Send response to Dialogflow
    } else {
      // If the response to the user includes rich responses or contexts send them to Dialogflow
      let responseJson = {};

      // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
      responseJson.speech = responseToUser.speech || responseToUser.displayText;
      responseJson.displayText = responseToUser.displayText || responseToUser.speech;

      // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
      responseJson.data = responseToUser.richResponses;

      // Optional: add contexts (https://dialogflow.com/docs/contexts)
      responseJson.contextOut = responseToUser.outputContexts;

      response.json(responseJson); // Send response to Dialogflow
    }
  }
});

// Construct rich response for Google Assistant
const app = new DialogflowApp();
const googleRichResponse = app.buildRichResponse()
  .addSimpleResponse('This is the first simple response for Google Assistant')
  .addSuggestions(
    ['Suggestion Chip', 'Another Suggestion Chip'])
    // Create a basic card and add it to the rich response
  .addBasicCard(app.buildBasicCard(`This is a basic card.  Text in a
 basic card can include "quotes" and most other unicode characters
 including emoji 📱.  Basic cards also support some markdown
 formatting like *emphasis* or _italics_, **strong** or __bold__,
 and ***bold itallic*** or ___strong emphasis___ as well as other things
 like line  \nbreaks`) // Note the two spaces before '\n' required for a
                        // line break to be rendered in the card
    .setSubtitle('This is a subtitle')
    .setTitle('Title: this is a title')
    .addButton('This is a button', 'https://assistant.google.com/')
    .setImage('https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
      'Image alternate text'))
  .addSimpleResponse({ speech: 'This is another simple response',
    displayText: 'This is the another simple response 💁' });

// Rich responses for both Slack and Facebook
const richResponses = {
  'slack': {
    'text': 'This is a text response for Slack.',
    'attachments': [
      {
        'title': 'Title: this is a title',
        'title_link': 'https://assistant.google.com/',
        'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
        'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        'fallback': 'This is a fallback.'
      }
    ]
  },
  'facebook': {
    'attachment': {
      'type': 'template',
      'payload': {
        'template_type': 'generic',
        'elements': [
          {
            'title': 'Title: this is a title',
            'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            'subtitle': 'This is a subtitle',
            'default_action': {
              'type': 'web_url',
              'url': 'https://assistant.google.com/'
            },
            'buttons': [
              {
                'type': 'web_url',
                'url': 'https://assistant.google.com/',
                'title': 'This is a button'
              }
            ]
          }
        ]
      }
    }
  }
};
