import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import { errorResponse, log1, successResponse } from '../lib/general.lib.js';
import messages from './messages.js';

const transport = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

export const sendMail = async (mailOptions) => {
    log1(["sendMail called..." + process.env.HOST]);
    await transport.sendMail(mailOptions, async (error, info) => {
        if (error) {
            log1(["sendMail error----->", error]);
            return errorResponse(messages.unexpectedDataError);
        } else {
            log1(["sendMail info response----->", info.response]);
            return successResponse("Email sent: " + info.response);
        }
    });
}