const assert = require('assert')
const emailservice = require('../service/email.service')
var config = require('../configuration');
const student_dao = require('./../dao/student.dao')


describe('Trigger sendStudentLatestChangesApplicationEveryMondayViaEmail manually', () => {

    it(`trigger sendStudentLatestChangesApplicationEveryMondayViaEmail and should not encounter any error'`, async () => {
        const result = await emailservice.sendStudentLatestChangesApplicationWeeklyPotentialInvoice()
        console.log(result)
    })

    // it(`trigger dao and should not encounter any error'`, async () => {
    //     const result = await student_dao.getStudentLatestChangesApplicationEverySevenPreviousDays()
    //     console.log(result)
    // })
})