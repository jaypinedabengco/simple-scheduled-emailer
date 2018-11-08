const assert = require('assert')
const student_dao = require('./../dao/student.dao')

describe('Check student application dao', () => {

    it(`test xxxxx`, async() => {
        const result = await student_dao.getAllStudentsDetailedInformation()
        console.log(result)
    })
    
})