import joi from "joi";
export function CreateTripSchema(obj) {
    const schema = joi.object({
        title: joi.string().trim().max(120).required(),
        category: joi.number().required(),
        description: joi.string().trim().min(10).required(),
        duration: joi.string().trim().required(),
        location: joi.string().trim().required(),
        price: joi.number().min(1).required(),
        meetingPlace: joi.string().trim().required(),
    });
    return schema.validate(obj)
}

export function CreatedImageSchema(obj){
    const schema = joi.array().items({
        url:joi.string().trim().required(),
        publicid:joi.string().trim().required()
    }).min(1).max(4).required()
    return schema.validate(obj)
}