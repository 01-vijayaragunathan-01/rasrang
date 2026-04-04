import { updateEvent } from './controllers/adminEventController.js';

const req = {
    params: { eventId: '557eb0cc-2e36-45d8-9945-7db92b2bb182' },
    user: { id: 'test' },
    body: {
                title: 'Test Event',
                category: 'Technical',
                date: '2026-04-07',
                time: '02:00 AM',
                capacity: '1000',
                description: 'test description',
                isHeadliner: false
    }
};

const res = {
    status: function(c) {
        console.log("STATUS:", c);
        return this;
    },
    json: function(d) {
        console.log("JSON:", d);
    }
};

updateEvent(req, res);
