import { JSONObjectKeyAndTypeValidator } from '../interfaces/generalInterface';

export const InsertMashValidationObject: JSONObjectKeyAndTypeValidator[] = [
  {
    key: 'event_name',
    required: true,
    type: 'string',
  },
  {
    key: 'event_lat',
    required: true,
    type: 'number',
  },
  {
    key: 'event_log',
    required: true,
    type: 'number',
  },
  {
    key: 'place_name',
    required: true,
    type: 'string',
  },

  {
    key: 'category',
    required: false,
    type: 'number',
  },
  {
    key: 'activity',
    required: false,
    type: 'number',
  },
  {
    key: 'event_date_timestamp',
    required: true,
    type: 'number',
  },
  {
    key: 'party',
    required: false,
    type: 'number',
    regex: /^[0,1]$/,
  },
  {
    key: 'total_allowed_people',
    required: false,
    type: 'number',
  },
];

export const EventSwipeValidationObject : JSONObjectKeyAndTypeValidator[] = [
  {
    key :'event_id',
    type : 'number',
    required: true
  },
  {
    key :'swiped',
    type : 'boolean',
    required: true
  }
]