export function totalPhoneBill(billList, callCost, smsCost) {
    const bill = billList.split(', ');
    let total = 0;
    console.log('bill',billList);
    console.log('call',callCost);
    console.log('sms',smsCost);
    
    for (let i = 0; i < bill.length; i++) {
      const totalBillList = bill[i].trim();
      if (totalBillList.includes('call')) { // The 2 'calls' are added to the 'callCost' of the 'total' then the rest is added to the total 'smsCost'
        total += callCost;
      } else if (totalBillList.includes('sms')) {
        total += smsCost;
      }
    }
    
    return 'R' + total.toFixed(2); // We want our string to return in the 'Rand' currency format with 2 decimal places put in
  }
  
  // var totalBillList = 'call, sms, call, sms, sms';
  // console.log(totalPhoneBill(totalBillList, 2.75, 0.65));