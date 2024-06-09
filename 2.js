const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const express = require("express")
const cors = require("cors");
const nodemailer = require('nodemailer')
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = "AIzaSyCRSMGR4x30fmKVZDUq403NarMyx5fULN8";
const config = require('../config/id.js');


const privatekey = config.googlePriavateKey;
const projectId = config.googleProjectId;
const sessionId = config.dialogFlowSessionID;

const sessionClient = new dialogflow.SessionsClient({
    credentials: {
        client_email: config.googleClientEmail,
        private_key: config.googlePrivateKey.replace(/\\n/g, '\n'), // Ensure proper formatting of the private key
    },
});


const textQuery = async(userText, userId)=>{
    const sessionpath = sessionClient.sessionPath(projectId, sessionId+userId);
}

const app = express();
app.use(express.json())
app.use(cors());
const PORT = process.env.PORT || 8000;

async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // console.log(genAI)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 50,
    };

    const chat = model.startChat({
        generationConfig,
        history: [
        ],
    });

    const result = await chat.sendMessage(queryText);
    const response = result.response;
    return response.text();
}


app.get('/', (req, res) => {
    res.send('Hello Dialogflow!')
})

app.post("/webhook", async (req, res) => {
    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({ request: req, response: res });

    function hi(agent) {
        console.log(`intent  =>  hi`);
        agent.add("Hi there, I am your AI Assistant, Could you please tell me your name? (server)")
    }
    function fallback(agent) {
        console.log('intent => Fallback');
        agent.add('fallback from server');
    }

    function name(agent) {
        console.log(`intent  =>  name`);
        agent.add("Can Your Tell Me Your name ? (server)")
    }

    function gender(agent) {
        console.log(`intent  =>  gender`);
        agent.add("Can you tell me your gender? (server)")
    }

    function num(agent) {
        console.log(`intent  =>  num`);
        agent.add("Can I Also Have Your contact Number? (server)")
    }

    function cnic(agent) {
        console.log(`intent  =>  cnic`);
        agent.add("Can I Please Have Your cnic number ? (server)")
    }

    function dob(agent) {
        console.log(`intent  =>  dob`);
        agent.add("tell me your date of birth? (server)")
    }

    function city(agent) {
        console.log(`intent  =>  city`);
        agent.add("kindly tell me which city are you from ? (server)")
    }

    // function course(agent) {
    //     console.log(`intent  =>  Course`);
    //     agent.add("Can I Also Have Your Active Active E-Mail Address? (server)")
    // }
    
    function email(agent) {
        const { person, phone, email, city, number } = agent.parameters;
        console.log(`intent  =>  Email`);
        const accountSid = 'AC692953928c5aa7e1cbd0d3276c02ca81';
        const authToken = 'b14ef5cb5541dad88a0421581d8b9228';
        const client = require('twilio')(accountSid, authToken);

        agent.add("The Details Has Been Sent To Your E-mail. (server)")

        // client.messages
        // .create({
        //         body:`Hi there, We received your email with your name with your phone number. Thank You for your email.`,
        //         from: '+17745511511',
        //         to: '+923362741319'
        // })
        // .then(message => console.log(message.sid))
        // .done();

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'm.rohaanamir2003@gmail.com',
              pass: 'champion200410'
            }
          });
          
          var mailOptions = {
            from: 'm.rohaanamir2003@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: 'Testing',
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }

    async function fallback() {
        let action = req.body.queryResult.action;
        let queryText = req.body.queryResult.queryText;

        if (action === 'input.unknown') {
            let result = await runChat(queryText);
            agent.add(result);
            console.log(result)
        }else{
            agent.add(result);
            console.log(result)
        }
    }
    
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('name', name);
    intentMap.set('gender', gender);
    intentMap.set('num', num);
    intentMap.set('cnic', cnic);
    intentMap.set('dob', dob);
    intentMap.set('city', city);
    // intentMap.set('course', course);
    intentMap.set('email', email);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});