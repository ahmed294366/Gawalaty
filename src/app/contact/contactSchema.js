import joi from "joi"


export function questionSchema(obj) {
    const schema = joi.object({
        name: joi.string().trim().required(),
        email: joi.string().trim().email().required(),
        question: joi.string().trim().max(100).required(),
        phone: joi.string().trim().pattern(/^(\+2)?01[0|1|2|5][0-9]{8}$/),
        category: joi.string().valid(
            "booking_inquiry",
            "technical_support",
            "cancellation",
            "feedback",
            "become_a_guide",
            "partnership",
            "other").required(),

    });
    return schema.validate(obj)
}