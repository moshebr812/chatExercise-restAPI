// Services
const fileService = require ('fs')
const expressService = require ('express')
const pathService = require ('path');
const { response } = require('express');

// Files And Constants
const defaultPort = 8080;
const mainHTMLFile = './chatExercise-restAPI.html';
const chatHistoryFile = './public/data/chat-data-file.json';
const usersInfoFile = './public/data/users-info-file.json';

// init const & apps
const myApp = expressService();
// if file not found, init to Empty Array
let chatArray = require (chatHistoryFile) || []; 
const usersArray = require (usersInfoFile) || [];

// Debug Variables
const fullDebug = true;
const sectionSplit = `\n${"=".repeat(50)}\n`;
let reqCounter=0;

// =============================    clear screen & print Debug for start
console.clear();
console.log (`\n${"=".repeat(50)}\nSTARTED "chatExercose-restAPI.js"  PORT: ${defaultPort}\n${"=".repeat(50)}\n`);

// =============================    Open Server to listen for requests
myApp.listen (defaultPort);

// =============================    For loadig the CSS file
myApp.use ( expressService.static(pathService.join ( __dirname , '/public/') ) );
// =============================    Convert all the input data in BODY to a valid JavaScript Object
myApp.use ( expressService.json()); 

// =============================    Middleware to Increase Debug Counter
myApp.use ( (request, response, next) => {
    console.log(`${sectionSplit}myApp.use (middleware) .............. reqCounter = ${++reqCounter}`);
    console.log(`..........request.url = ${request.url}  ..... request.method = ${request.method}`);
    next();
});

// =============================    Load the HTML + CSS files only once
myApp.get ('/' , (request, response) => {
    console.log (`${sectionSplit}myApp.get('/')...........response.send .... mainHTMLFile`);
    const HTMLFile = fileService.readFileSync (mainHTMLFile, {encoding: 'utf-8'});
    // return the HTML File
    response.send( HTMLFile );
});

// =============================    CRUD messages
// =============================    Read All
myApp.get('/message', (request, response) => {
    console.log(`${sectionSplit}myApp.get('/message') .......... read all messages from file. chatArray.length=${chatArray.length}`);;
    response.send (chatArray);
});

// =============================    Read by message ID

// =============================    Insert message using POST
myApp.post ('/message', (request, response) => {
    console.log(`${sectionSplit}myApp.post('/message')  ..... method=POST .... meaning INSERT`);
    console.log (`new input (stringify(request.body) \n ${JSON.stringify (request.body)} `);
    // NOTES
        // 1.  Added middleware expressService.json() so I can use request.body as a JS Object
        // 2.  [A]. Add new data to "glocal" chatArrayy  [B]. Save to file  [C]. Return the new array

    let newMessage = {  "nickName": (request.body.nickName===''? 'anonymous' : request.body.nickName),
                        "message": request.body.message,
                        "id":request.body.id,
                        "insertTime": request.body.insertTime };
    // [A]
    chatArray.push (newMessage);
    // If no changes need to be applied on the body, I can apply it directly in the chatArr.push()
    // chatArray.push (request.body);
    // [B]
    fileService.writeFileSync (chatHistoryFile , JSON.stringify (chatArray) );
    // [C]
    response.send (chatArray);
});

// =============================    DELETE HISTORY using DELETE
myApp.delete('/message' , (request, response) => {
    console.log(`${sectionSplit}myApp.delete('/message')  ..... method=DELETE .... meaning DELETE`);
    chatArray = []; // set array to empty
    fileService.writeFileSync (chatHistoryFile, JSON.stringify (chatArray) ); // write to file
    response.send (chatArray); // standartzation --> return the empty array
});

myApp.delete('/message/:id' , (request, response) =>{
    let idToDel = request.params.id;

    console.log(`${sectionSplit}myApp.delete('/message/:id')  ..... method=DELETE .... for specific id ${idToDel}`);
    // [A] - find the ID in the array
    let location = chatArray.findIndex ( element => element.id === idToDel);
    console.log(`...... location of value ${idToDel} in the array is ${location}`);

    if (location<0) {
        console.log (`FAILED TO FIND requested CHAT TO DEL id=${idToDel}`);
        // we do NOT change the array  "chatArray"
    } else {
        console.log (`...... removing chat id = ${idToDel} using splice`);
        // [B] - remove 1 item from Array
        chatArray.splice (location, 1);
        // [C] - update the file
        fileService.writeFileSync(chatHistoryFile, JSON.stringify (chatArray) );
        // [D] we will return Array after removal & save to file;
    }   
    response.send ( chatArray ); 
});
