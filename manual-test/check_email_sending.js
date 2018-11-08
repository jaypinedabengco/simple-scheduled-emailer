const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const config = require('./../configuration')
const assert = require('assert')
const healthcheck = require('./../service/healthcheck.service')


const createTransporter = async () => {
    return nodemailer.createTransport(smtpTransport({
        service: config.email.service,
        host: config.email.ehost,
        port: config.email.eport,
        quitwait: config.email.quitwait,
        auth: { user: config.email.euser, pass: config.email.epass }
    }));
}

describe('Check if email is being sent', () => {

    it(`should be able to setup transporter properly`, async () => {
        await createTransporter()
    })

    it(`send simple email to 'testemail123@yopmail.com' and no error`, async () => {
        const transporter = await createTransporter()

        return new Promise((resolve, reject) => {
            //set content   
            let mail_options = {
                from: 'noreply@globalstudypartners.com',
                to: 'testemail123@yopmail.com',
                subject: 'test', // Subject line
                html: '<h1>HEllo</h1>' // plain text body, 
            }

            // send mail with defined transport object
            transporter.sendMail(mail_options, (error, info) => {
                if ( error ) {
                    return reject(error)
                }
                return resolve(info)
            });

        });
    }).timeout(10000)

})