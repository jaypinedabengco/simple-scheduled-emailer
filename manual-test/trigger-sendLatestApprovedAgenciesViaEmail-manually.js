const assert = require('assert')
const emailservice = require('./../service/email.service')
var config = require('./../configuration');


describe('Trigger sendLatestApprovedAgenciesViaEmail manually', () => {

    it(`email config should be 'john.mayuga@yopmail.com'`, async () => {
        console.log(config.email.efrom)
        assert.equal(config.email.student_app_email.to, 'john.mayuga@yopmail.com')
    })

    it(`trigger sendLatestApprovedAgenciesViaEmail and should not encounter any error'`, async () => {
        const result = await emailservice.sendIntakeReportViaEmail()
        console.log(result)
    })

})