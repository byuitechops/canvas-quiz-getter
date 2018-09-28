var prompt = require('prompt');
var quizGetter = require('./index.js');

/**
 * The function with all the prompt inputs and validation
 */
function getInput() {
    return new Promise((resolve, reject) => {
        // prompt to receive the filepath to the list of courses to run the backup on
        var schema = {
            properties: {
                domain: {
                    type: 'string',
                    description: 'Canvas Domain <byui|byui.test>',
                    pattern: /byui|byui\.test/,
                    message: '<byui|byui.test>',
                    required: true,
                    default: 'byui'
                },
                subaccount: {
                    type: 'number',
                    description: 'The subaccount number you\'d like to run this on',
                    required: true,
                    default: 8
                },
                includeNestedAccounts: {
                    type: 'boolean',
                    description: 'Would you like to run it on all the accounts under that number?',
                    required: true,
                    default: false
                },
                saveDirectory: {
                    type: 'string',
                    description: 'Where would you like to store the report? (i.e. ../reports)',
                    required: true,
                    default: './reports'
                }
            }
        };

        prompt.message = '';

        prompt.start();

        prompt.get(schema, (err, userInput) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            resolve(userInput);
        });
    });
}

async function run() {
    var userInput = await getInput();
    quizGetter.main(userInput);
}

run();