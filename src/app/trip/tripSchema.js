import joi from "joi";

export function ReportSchema(obj){
    const schema = joi.object({
        text:joi.string().trim().required(),
        reviewid:joi.number().required()
    });
    return schema.validate(obj)
}
export function UpdateTripSchema(obj) {
    const schema = joi.object({
        title: joi.string().min(5).max(200),
        description: joi.string().min(10),
        price: joi.number().min(1),
        duration: joi.string(),
        location: joi.string(),
        meetingPlace: joi.string(),
        guide: joi.number(),
        category:joi.number()
    });
    return schema.validate(obj)
}
export function CreateDateSchema(obj) {
    const schema = joi.object({
        maxPeople: joi.number().min(1).required(),
        date: joi.date().required(),
        tripid: joi.number().required(),
    });
    return schema.validate(obj)
}
export function CreateBookingSchema(obj) {
    const schema = joi.object({
        dateid: joi.number().required(),
        tripid: joi.number().required(),
        people: joi.number().required().min(1),
    });
    return schema.validate(obj)
}
export function RateSchema(obj) {
    const schema = joi.object({
        rate: joi.number().min(1).max(5).required(),
        comment: joi.string().trim(),
        tripid: joi.number().required()
    });
    return schema.validate(obj)
}
export function ReviewImageSchema(images) {
    images = images.map(img => {
        return {
            name: img.name,
            type: img.type,
            size: img.size
        }
    });
    const schema = joi.object({
        images: joi.array().items(
            joi.object({
                name: joi.string().required(),
                type: joi.string().valid("image/jpg", "image/jpeg", "image/png", "image/webp").required(),
                size: joi.number().max(1024 * 1024 * 5).required()
            })
        ).min(1).max(3)
    });
    return schema.validate({ images })
}