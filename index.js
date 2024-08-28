import express from 'express';
import cors from 'cors';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import { totalPhoneBill } from './phonebill.js';

const app = express();

app.use(express.static('public'))
app.use(express.json())
app.use(cors())

const db = await sqlite.open({ //This open the database connection
    filename: './data_plan.db',
    driver: sqlite3.Database
});

await db.migrate();

app.post('/api/phonebill/', async function (httpRequest, httpResponse) {
    const { price_plan, actions } = httpRequest.body; //price plan and actions is extracted from the request body
    console.log('body',httpRequest.body);
    if (!price_plan || !actions) {
        return httpResponse.status(400).json({
            message: "Please provide a valid price plan and actions."
        });
    } //this part will check if the price_plan and actions are provided otherwise an error will appear where the message will be displayed

    try {
        const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = $1', [price_plan]); //this will find the specific price plan from the database

        if (!plan) {
            return httpResponse.status(404).json({
                message: `Price plan '${price_plan}' not found.`
            });
        } // this will return an error response if there are no matching plans found.
        console.log('plan', plan);
        
        const total = totalPhoneBill(actions, plan.call_price, plan.sms_price);
        // this will call the totalPhoneBill function with the provided actions and fetched plan prices provided in the database

        httpResponse.json({ total }); // This will return the calculated total in the response
    } catch (error) {
        console.log(error);
        
        httpResponse.status(500).json({
            message: "An error occurred while calculating the phone bill.",
            error: error.message
        }); // This part will handle any errors that occure during the database operations. This will definitely help me to catch errors... get it
    }

    // const { sms_cost, call_cost} = await db.get(`SELECT * FROM price_plan where plan_name = $1`, [price_plan]);
    // // console.log('PRICE PLAN', );
    // const total = totalPhoneBill(actions, sms_cost, call_cost);
    // return httpResponse(200).json({total});

});

app.get('/api/price_plans/', async function (httpRequest, httpResponse) {
    try {
        const pricePlans = await db.all('SELECT * FROM price_plan');//This will retrieve all the price plans from the database using the db.all method.
        httpResponse.json(pricePlans);// This will send back the list of price plans as a JSON response
        // it sends the list back to the client that made the request
    } catch (error) {
        httpResponse.status(500).json({
            message: "An error occurred while retrieving the price plans.",
            error: error.message
        }); // This part will handle any errors that occure during the database operations. This will definitely help me to catch errors... get it
    }
});

app.post('/api/price_plan/create', async function (httpRequest, httpResponse) {
    const { name, call_cost, sms_cost } = httpRequest.body; //This will extract the stated from the request body.

    if (!name || call_cost === undefined || sms_cost === undefined) {
        return httpResponse.status(400).json({
            message: "Please provide a valid name, call_cost, sms_cost."
        });
    }// This validates that all the required fields are present otherwise, it will return the error message.

    try {
        await db.run('INSERT INTO price_plan (plan_name, call_price, sms_price) VALUES (?, ?, ?)', [name, call_cost, sms_cost]);
        // This will insert the new price plan into the database using the db.run method

        httpResponse.status(201).json({
            message: `Price plan '${name}' created successfully.`
        }); // If successful, it will return this message to indicate that the price plan was created.
    } catch (error) {
        httpResponse.status(500).json({
            message: "An error occurred while creating the price plan.",
            error: error.message
        }); // This part will handle any errors that occure during the database operations. This will definitely help me to catch errors... get it
    }
});

app.post('/api/price_plan/update', async function (httpRequest, httpResponse) {
    const { name, call_cost, sms_cost } = httpRequest.body; //This will destructure the stated from the request body.

    if (!name || call_cost === undefined || sms_cost === undefined) {
        return httpResponse.status(400).json({
            message: "Please provide the price plan name, call cost, SMS cost."
        });
    } // This will check if the required data stated by the body is provided otherwise an error message is displayed.

    try {
        const result = await db.run('UPDATE price_plan SET call_price = ?, sms_price = ? WHERE plan_name = ?', [call_cost, sms_cost, name]); //This method executes the query that updates the price plan data.
        //The call and sms cost values are updated for the specific price plan identified by its name.

        if (result.changes === 0) {
            return httpResponse.status(404).json({
                message: `Price plan '${name}' not found.`
            });// This error message will be displayed if no price plan with the given name is found
        }

        httpResponse.json({
            message: `Price plan '${name}' updated successfully.`
        }); // Successful message for the update
    } catch (error) {
        httpResponse.status(500).json({
            message: "An error occurred while updating the price plan.",
            error: error.message
        }); // An error message when something happends during the update process.
    }

});

app.post('/api/price_plan/delete', async function (httpRequest, httpResponse) {
    const { id } = httpRequest.body; // This will extract the 'id' from the body

    if (!id) {
        return httpResponse.status(400).json({
            message: "Please provide a valid price plan ID."
        });
    } //This will check if the 'id' is provided otherwise it will return an error response.

    try {
        const result = await db.run('DELETE FROM price_plan WHERE id = ?', [id]);
        // This will execute the SQL statement to delete the price plan with the provided 'id'.

        if (result.changes === 0) {
            return httpResponse.status(404).json({
                message: `Price plan with ID '${id}' not found.`
            });
        }// This will check if any row was actually deleted otherwise the error message is displayed.

        httpResponse.json({
            message: `Price plan with '${id}' has been deleted successfully.`
        }); //This will send a success response if the price plan was deleted.
    } catch (error) {
        httpResponse.status(500).json({
            message: "An error occurred while deleting the price plan.",
            error: error.message
        }); //This handles any errors that occure during the deleting process and it will send the error message.
    }
});

app.post('/api/phone_bill/total', async function (httpRequest, httpResponse) {
    const { plan_name, total } = httpRequest.body;

    try {
        await db.run(`
            INSERT INTO price_plan_totals (plan_name, total)
            VALUES (?, ?)`, [plan_name, total]);
            resizeBy.status(200).json({ message: 'Total added successfully' });
    } catch (error) {
        httpResponse.status(500).json({ message: 'Error adding total' });
    }
});

app.get('/api/price_plans/totals', async function (httpRequest, httpResponse) {
    try {
        const totals = await db.all(`
            SELECT plan_name, SUM(total) AS total, MAX(updated_at) AS updated_at
            FROM price_plan_totals
            GROUP BY plan_name
            `);
            httpResponse.json(totals);
    } catch (error) {
        httpResponse.status(500).json({ message: 'Error fetching totals for price plans' });
    }
});

app.get('/api/price_plans/summary', async function (httpRequest, httpResponse) {
    try {
        const totals = await db.all(`
            SELECT plan_name, SUM(total) AS total, MAX(updated_at) AS updated_at
            FROM price_plan_totals
            GROUP BY plan_name
            `);
            const mostSpent = totals.reduce((max, plan) => plan.total > max.total ? plan : max, totals[0]);
            const leastSpent = totals.reduce((min, plan) => plan.total < min.total ? plan : min, totals[0]);
            httpResponse.json({ totals, mostSpent, leastSpent });
    } catch (error) {
        httpResponse.status(500).json({ message: 'Error fetching summary for price plans' });
    }
});

const PORT = process.env.PORT || 4011;
app.listen(PORT, function () {
    console.log(`Server started http://localhost:${PORT}`);
})


