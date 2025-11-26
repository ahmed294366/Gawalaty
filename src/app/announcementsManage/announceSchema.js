import joi from "joi";

export function announceSchema(obj){
    const schema = joi.object({
        title:joi.string(),
        description:joi.string().required(),
        expiresAt:joi.date().required(),
        trip:joi.number(),
    });
    return schema.validate(obj);
}