const assert = require('assert')
const healthcheck = require('./../service/healthcheck.service')

describe('Check Health', () => {

    it(`db status should be '1'`, async() => {
        const result = await healthcheck.getHealthCheck()
        assert(result.db.status === '1')
    })
    
})