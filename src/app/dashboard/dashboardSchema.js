import joi from "joi";


export function CategorySchema(obj) {
    const schema = joi.object({
        name: joi.string().trim().min(1).required()
    });
    return schema.validate(obj)
}

export function featureSchema(obj) {
    const schema = joi.object({
        name: joi.string().trim().required(),
        description:joi.string()
    })
    return schema.validate(obj)
}

// payment
export function paymentBankSchema(obj) {
    const schema = joi.object({
        bankName: joi.string().trim().required(),
        accountNumber: joi.string().trim().required(),
        accountName: joi.string().trim().required(),
        iban: joi.string().required()
    });
    return schema.validate(obj)
}

export function replySchema(obj){
    const schema = joi.object({
        text:joi.string().trim().required()
    });
    return schema.validate(obj)
}

export function vodafonePaymentSchema(obj) {
    const schema = joi.object({
        phoneNumber: joi.string().trim().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}$/).required()
    });
    return schema.validate(obj)
}

export function rejectSchema(obj) {
    const schema = joi.object({ adminNotes: joi.string().trim().required() });
    return schema.validate(obj);
}
export function approveSchema(obj) {
    const schema = joi.object({ adminNotes: joi.string().trim() });
    return schema.validate(obj);
}

export function withdrawalApproveBankSchema(obj) {
    const schema = joi.object({
        paymentAccountId: joi.number().required(),
        proofUrl: joi.string().required(),
        proofId: joi.string().trim().required(),
        transactionId: joi.string().trim().required(),
        adminNotes: joi.string()
    });
    return schema.validate(obj)
}
export function withdrawalApproveVodafoneSchema(obj) {
    const schema = joi.object({
        paymentAccountId: joi.number().required(),
        proofUrl: joi.string().required(),
        proofId: joi.string().trim().required(),
        adminNotes: joi.string()
    });
    return schema.validate(obj)
}

export function languageSchema (obj){
    const schema = joi.object({
        name:joi.string().trim().required()
    })
    return schema.validate(obj)
}

export function settingSchema(obj){
    const schema = joi.object({
        key:joi.string().trim().required(),
        value:joi.boolean().required()
    });
    return schema.validate(obj)
}