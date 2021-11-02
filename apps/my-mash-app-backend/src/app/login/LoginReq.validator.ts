import { JSONObjectKeyAndTypeValidator } from "../interfaces/generalInterface";

export const InsertUserValidationObject: JSONObjectKeyAndTypeValidator[] = [
    {
        key:'full_name',
        type: 'string',
        required: true,
    },
    {
        key:'email',
        type: 'string',
        regex : /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,6})+$/i,
        required: false,
    },
    {
        key:'phone',
        type: 'number',
        regex:/^\d{11,14}$/,
        required: false,
    },
    {
        key:'dob_timestamp',
        type: 'number',
        required: true,
    },
    {
        key:'gender',
        type: 'string',
        required: true,
    }
]