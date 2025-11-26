import joi from "joi";

export function editDateSchema(obj){
    const schema = joi.object({
        date:joi.date(),
        maxpeople:joi.number().min(0)
    });
    return schema.validate(obj)
}