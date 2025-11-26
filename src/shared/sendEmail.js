"use server"
import nodemailer from "nodemailer";
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        pass: process.env.APP_EMAIL_PASS,
        user: process.env.APP_EMAIL_ADDRESS
    }
});

export async function sendTokens({ email, token, type }) {

    let link;
    if (type === "verify") {
        link = `http://localhost:3000/verify/${email}/${token}`
    } else {
        link = `http://localhost:3000/password-reset/${email}/${token}`
    }
    const object = {
        from: `"Gawalaty" <${process.env.APP_EMAIL_ADDRESS}>`,
        to: email,
        subject: type === "verify" ? "verify" : "Reset Password",
        html: `<div>
        <p>${type === "verify" ? "To Verify This Email Click The Link Below" : "To Reset Password Click The Link Below"}</p>
        <a href="${link}">${type === "verify" ? "Verify" : "Reset"}</a>
        </div>`

    }
    const info = await transport.sendMail(object);
    console.log("Mail Sent To " + info.response)
}

export async function sendCancelledDateMessage({ email, trip, date, name }) {
    try {
        const objOptions = {
            from: `"Gawalaty" <${process.env.APP_EMAIL_ADDRESS}>`,
            to: email,
            subject: "Trip cancelled",
            html: `<div>
            <p>
            Dear ${name},
            <br/>
            We regret to inform you that your scheduled trip (name: ${trip}, date: ${date}) has been cancelled by the admin due to unexpected circumstances.
            <br/>
            The full amount you paid has been refunded to your wallet in your account.
            You can use these funds to book another trip at any time.<br/>
            If you have any questions or need further assistance, please contact us at (+20) 2-XXXX-XXXX.
            <br/>
            We sincerely apologize for the inconvenience and appreciate your understanding.
            <br/>
            Best regards,
            <br/>
            The Travel Support Team
            </p>
            </div>`
        }
        const info = await transport.sendMail(objOptions);
        console.log("Mail sent to " + info.response)
    } catch (error) {
        console.log(error);
    }
}

export async function approveBookingMessage({ email, trip, date, total }) {
    try {
        const message = {
            from: `"Gawalaty" <${process.env.APP_EMAIL_ADDRESS}>`,
            to: email,
            subject: "Trip Booking Approved",
            html: `
            <div>
                Hello,<br/><br/>
                Great news! Your booking request has been <strong>approved</strong>.<br/><br/>

                <strong>Trip:</strong> ${trip} <br/>
                <strong>Date:</strong> ${date} <br/>
                <strong>Total:</strong> ${total} LE <br/><br/>

                We’re excited to have you on this trip.  
                If you have any questions or need help, feel free to contact our support team anytime.<br/><br/>

                Thank you for choosing Gawalaty.
            </div>
            `
        };

        const info = await transport.sendMail(message);
        console.log("Mail sent:", info.response);
        
    } catch (error) {
        console.log(error);
    }
}


export async function acceptTransactionMessage({ email, amount, type }) {
    try {
        const messageType = type === "deposit" ? "Deposit" : "Withdrawal";

        const message = {
            from: `"Gawalaty" <${process.env.APP_EMAIL_ADDRESS}>`,
            to: email,
            subject: `${messageType} Approved`,
            html: `
            <div>
                Hello,<br/><br/>
                Good news! Your recent <strong>${messageType}</strong> request (amount: <strong>${amount}</strong>) has been <strong>approved</strong> by the admin.<br/><br/>
                
                You can check the transaction details for more information.<br/><br/>
                
                If you have any questions or need assistance, feel free to contact our support team anytime.<br/><br/>
                
                Thank you for using our service.
            </div>
            `
        };

        const info = await transport.sendMail(message);
        console.log("Mail sent: " + info.response);
    } catch (error) {
        console.log(error);
    }
}


export async function rejectTransactionMessage({ email, type, amount }) {
    try {
        const messageType = type === "deposit" ? "Deposit" : "Withdrawal";

        const message = {
            from: `"Gawalaty" <${process.env.APP_EMAIL_ADDRESS}>`,
            to: email,
            subject: `${messageType} Declined`,
            html: `
            <div>
                Hello,<br/><br/>
                We’re sorry to inform you that your recent <strong>${messageType}</strong> request (amount: <strong>${amount}</strong>) has been <strong>declined</strong> by the admin.<br/><br/>
                
                You can open the transaction details to view the reason for the rejection, and you may submit a new request if needed.<br/><br/>

                If you believe this was a mistake or you need further assistance, please feel free to contact our support team — we're happy to help.<br/><br/>
                
                Thank you for your understanding.
            </div>
            `
        };

        await transport.sendMail(message);
        console.log("Rejection mail sent");
    } catch (error) {
        console.log(error);
    }
}


