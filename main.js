


const express = require('express');
var { Readability, isProbablyReaderable } = require('@mozilla/readability');
var bodyParser = require('body-parser')
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');


// create an express app
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use((req, res, next) => {

    next();
});

// create a route for hello world
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// create a route for readability
app.post('/strip', (req, res) => {
    // get the document data from the request body
    const document_body = req.body.document_body;
    // get "check_probably_readerable" from the request body as boolean
    const check_probably_readerable = req.body.check_probably_readerable;
    // check validity of input
    if (document_body == null || check_probably_readerable == null) {
        res.status(400).send("Bad Request, missing 'document_body' or 'check_probably_readerable' in request body");
        return;
    }


    // purify
    const purifier = createDOMPurify(new JSDOM('').window);
    const purifiedDoc = new JSDOM(purifier.sanitize(document_body));

    // check if the document is readable
    if (check_probably_readerable && isProbablyReaderable(purifiedDoc.window.document)) {
        let article = new Readability(purifiedDoc.window.document).parse();
        res.status(200).json({
            title: article.title,
            content: article.textContent
        });
    }
    else {
        res.status(400).json({
            message: "Document is not readable"
        });
    }

});



// start the server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});