import joi from "joi";
export function LoginSchema(obj) {
    const schema = joi.object({
        email: joi.string().trim().email().required(),
        password: joi.string().trim().min(8).required()
    });
    return schema.validate(obj)
}

export const RegisterSchema = (obj) => {
    const schema = joi.object({
        name: joi.string().trim().min(2).max(100).required(),
        email: joi.string().trim().email().required(),
        password: joi.string().trim().min(8).required(),
        phone:joi.string().trim().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}/),
        dateOfBirth:joi.date()
    });
    return schema.validate(obj)
}

export function UserImageSchema(image) {
    const schema = joi.object({
        url: joi.string().required(),
        publicid: joi.string().required()
    });
    return schema.validate(image)
}

export function ProfileEditSchema(obj) {
    let schema;
    if (obj.phone) {
        schema = joi.object({
            name: joi.string().trim().min(3),
            phone: joi.string().trim().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}$/).messages({
                "string.empty": "Phone number is required.",
                "string.pattern.base": "Invalid Egyptian phone number. It should start with 010, 011, 012, or 015 and contain 11 digits.",
            }),
            location: joi.string(),
            bio: joi.string(),
            dateOfBirth: joi.date(),
        });
    } else {
        schema = joi.object({
            name: joi.string().trim().min(3),
            location: joi.string(),
            bio: joi.string(),
            dateOfBirth: joi.date(),
        });
    }
    return schema.validate(obj)
}

export function ChangePasswordSchema(obj) {
    const schema = joi.object({
        newPassword: joi.string().trim().min(8).required(),
        confirmPassword: joi.string().trim().min(8).required(),
        currentPassword: joi.string().trim().min(8).required()
    });
    return schema.validate(obj);
}

export function UserImageValidation(obj) {
    const schema = joi.object({
        publicid: joi.string().trim().required(),
        url: joi.string().trim().required()
    });
    return schema.validate(obj)
}




export function phoneSchema(phone) {
    const schema = joi.string().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}$/).required().messages({
        "string.empty": "Phone number is required.",
        "string.pattern.base": "Invalid Egyptian phone number. It should start with 010, 011, 012, or 015 and contain 11 digits.",
    })
    return schema.validate(phone)
}

export function uploadedImageSchema(obj) {
    const schema = joi.object({
        publicid: joi.string().trim().required(),
        url: joi.string().trim().required()
    });
    return schema.validate(obj)
}

export function bankDepositSchema(obj) {
    const schema = joi.object({
        transactionId: joi.string().required(),
        amount: joi.number().min(10).required(),
        userNotes: joi.string()
    })
    return schema.validate(obj)
}

export function vodaphoneDepositSchema(obj) {
    const schema = joi.object({
        userPhoneNumber: joi.string().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}$/).required().messages({
            "string.empty": "Phone number is required.",
            "string.pattern.base": "Invalid Egyptian phone number. It should start with 010, 011, 012, or 015 and contain 11 digits.",
        }),
        amount: joi.number().min(10).required().required(),
        userNotes: joi.string()
    })
    return schema.validate(obj)
}

export function withdrawBankSchema(obj) {
    const schema = joi.object({
        userAccountNumber: joi.string().required(),
        method: joi.string().trim().valid("bank").required(),
        userAccountName: joi.string().trim().required(),
        userBankName: joi.string().trim().required(),
        userNotes: joi.string().trim(),
        amount: joi.number().min(10).required(),
    })
    return schema.validate(obj)
}

export function withdrawVodafoneSchema(obj) {
    const schema = joi.object({
        userPhoneNumber: joi.string().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}$/).messages({
            "string.empty": "Phone number is required.",
            "string.pattern.base": "Invalid Egyptian phone number. It should start with 010, 011, 012, or 015 and contain 11 digits.",
        }).required(),
        method: joi.string().trim().valid("vodafone").required(),
        userNotes: joi.string().trim(),
        amount: joi.number().min(10).required(),
    })
    return schema.validate(obj)
}

export function withdrawUpdateSchema(obj) {
    const schema = joi.object({
        userAccountNumber: joi.string(),
        userAccountName: joi.string().trim(),
        userBankName: joi.string().trim(),
        userPhoneNumber: joi.string().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}$/).messages({
            "string.empty": "Phone number is required.",
            "string.pattern.base": "Invalid Egyptian phone number. It should start with 010, 011, 012, or 015 and contain 11 digits.",
        }),
        userNotes: joi.string().trim(),
        amount: joi.number(),
    })
    return schema.validate(obj)
}

export function emailSchema(obj){
    const schema = joi.object({
        email:joi.string().email().required()
    });
    return schema.validate(obj)
}
export function passwordSchema(obj){
    const schema = joi.object({
        password:joi.string().min(8).required()
    });
    return schema.validate(obj)
}

export function questionSchema(obj){
    const schema = joi.object({
        question:joi.string(),
        category:joi.string().valid("booking_inquiry",
            "technical_support",
            "cancellation",
            "feedback",
            "become_a_guide",
            "partnership",
            "other").required(),
    });
    return schema.validate(obj)
}

export function replySchema(obj){
    const schema = joi.object({
        text:joi.string().trim().required()
    });
    return schema.validate(obj)
}