document.addEventListener('alpine:init', () => {
    Alpine.data('pricePlan', () => ({
        currentPage: 'main', // This will keep track of the current page
        pricePlans: [], // This will store the available price plan
        newPlan: { name: '', call_cost: '', sms_cost: '' }, // This will store data for the new price plan
        updatedPlan: { name: '', call_cost: '', sms_cost: '' }, // This will store data for the price plan that needs to be updated
        deletePlan: '', // This will store the ID of the price plan to delete
        totalBill: { price_plan: '', actions: '' }, // This will store data for calculating the total phone bill
        totalBillResult: '', //This will store the total bill calculation result
        message: '', //This will store the messages for user feedback
        messageType: '', //This will store the type of message (success or error)
        pricePlanTotals: [], //This will store the total for each price plan
        mostSpentPlan: {},
        leastSpentPlan: {},
        // selectedPricePlan: '', //This will store selected price plan for total calculation

        async fetchPricePlanSummary() {
            try {
                const response = await axios.get('/api/price_plans/totals');
                const data = response.data;

                this.pricePlanTotals = data.totals;
                this.mostSpentPlan = data.mostSpent;
                this.leastSpentPlan = data.leastSpent;

                // console.log("Price plan summary:", data);
            } catch (error) {
                this.setMessage('Error fetching price plan summary', 'error');
                console.error('Error fetching summary:', error);
            }
        },

        async fetchPricePlans() {
            try {
                const response = await axios.get('/api/price_plans/');
                this.pricePlans = response.data;
            } catch (error) {
                this.setMessage('Error fetching price plans:', 'error');
            }
        },

        async fetchPricePlansTotal() {
            try {
                const response = await axios.get('/api/price_plans/totals');
                this.pricePlanTotals = response.data;
                // console.log("Fetched price plan totals:", this.pricePlanTotals);
                
            } catch (error) {
                this.setMessage('Error fetching totals for price plans', 'error');
            }
        },

        async createPricePlan() {
            try {
                const response = await axios.post('/api/price_plan/create', this.newPlan);
                this.newPlan = { name: '', call_cost: '', sms_cost: '' };
                this.currentPage = 'main';
                await this.fetchPricePlans();
                this.setMessage(response.data.message, 'SUCCESS');
            } catch (error) {
                this.setMessage(error.response.data.message || 'Error creating price plan', 'error');
            }
        },

        async updatePricePlan() {
            try {
                const response = await axios.post('/api/price_plan/update', this.updatedPlan);
                this.updatedPlan = { name: '', call_cost: '', sms_cost: '' };
                this.currentPage = 'main';
                await this.fetchPricePlans();
                this.setMessage(response.data.message, 'SUCCESS');
            } catch (error) {
                this.setMessage(error.response.data.message || 'Error updating price plan', 'error');
            }
        },

        async deletePricePlan() {
            try {
                const response = await axios.post('/api/price_plan/delete', { id: this.deletePlan });
                this.deletePlan = '';
                this.currentPage = 'main';
                await this.fetchPricePlans();
                this.setMessage(response.data.message, 'SUCCESS');
            } catch (error) {
                this.setMessage(error.response.data.message || 'Error deleting price plan', 'error');
            }
        },

        async calculateTotalBill() {
            try {
                const response = await axios.post('/api/phonebill/', this.totalBill);
                this.totalBillResult = response.data.total; //Stores the result
                this.setMessage(`The total phone bill is ${this.totalBillResult}`, 'SUCCESS');
            } catch (error) {
                this.setMessage(error.response.data.message || 'Error calculating total phone bill', 'error');
            }
        },

        setMessage(message, type) {
            this.message = message;
            this.messageType = type === 'SUCCESS' ? 'alert-success' : 'alert-danger';
            setTimeout(() => {
               this.message = ''; 
            }, 5000); 
        },

        async init() {
            await this.fetchPricePlans();
            // await this.fetchPricePlansTotal();
            await this.fetchPricePlanSummary();
        }
    }));
});


