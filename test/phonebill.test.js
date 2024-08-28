import assert from "assert";
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import { totalPhoneBill } from "../phonebill.js";

describe('The totalPhoneBill function', function () {
    let db; // To hold the database connection

    before(async function() { // Used to open the database connection... the before runs before any test
        db = await sqlite.open({
            filename: './data_plan.db',
            driver: sqlite3.Database
        });
    });

    it('should calculate the total bill for the "sms 101" plan - call, sms, call, sms, sms.', async function () {
        const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', 'sms 101'); //retrieves from the database
        assert.equal('R7.79', totalPhoneBill('call, sms, call, sms, sms', plan.call_price, plan.sms_price)); //accesses sms and call price from the plan
    });

    it('should calculate the total bill for the "call 101" plan - call, sms.', async function () {
        const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', 'call 101');
        assert.equal('R2.40', totalPhoneBill('call, sms', plan.call_price, plan.sms_price));
    });

    it('should calculate the total bill for the "call 201" plan - sms, sms.', async function () {
        const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', 'call 201');
        assert.equal('R3.70', totalPhoneBill('sms, sms', plan.call_price, plan.sms_price));
    });

    after(async function() {
        await db.close(); //Used to close the database connection after the tests are finished
    });
});