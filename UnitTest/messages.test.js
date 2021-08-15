const app = require('../app')
const request = require('supertest');
const db = require('./db-handler');
const Message = require('../models/Message');
const { fakeUsers, fakeMessageData } = require('../fixtures/index');
const { validateNotEmpty, validateStringEquality } = require('../utils/test-utils/validators.utils');

const agent = request.agent(app);


beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Save message to mongo', () => {
    test('it should validate saving a new message successfully', async () => {
        const validMessage = new Message(fakeMessageData);
        const savedMessage = await validMessage.save();

        validateNotEmpty(savedMessage);
        validateStringEquality(savedMessage.sender, fakeMessageData.sender);
        validateStringEquality(savedMessage.text, fakeMessageData.text);
        validateStringEquality(savedMessage.seen, fakeMessageData.seen);
        validateStringEquality(savedMessage.conversationId, fakeMessageData.conversationId);
    });

});
describe('POST /api/messages/', () => {
    test('It should create a new message', done => {
        agent
            .post('/api/auth/register')
            .send(fakeUsers[0])
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/register')
                    .send(fakeUsers[1])
                    .expect(200)
                    .then(res => {
                        expect(res.body._id).toBeTruthy();
                        agent
                            .get('/api/users/allUsers')
                            .expect(200)
                            .then(res => {
                                agent
                                    .post('/api/conversations')
                                    .send({
                                        senderId: res.body[0]._id,
                                        receiverId: res.body[1]._id
                                    })
                                    .expect(200)
                                    .then(res => {
                                        expect(res.body._id).toBeTruthy();
                                        const message = {
                                            sender: res.body.members[0]._id,
                                            text: "newMessage",
                                            seen: false,
                                            conversationId: res.body._id,
                                        }
                                        agent
                                            .post('/api/messages')
                                            .send(message)
                                            .expect(200)
                                            .then(res => {
                                                expect(res.body._id).toBeTruthy();
                                                validateNotEmpty(res.body);
                                                validateStringEquality(res.body.text, "newMessage")
                                                done();
                                            });
                                    });

                            });
                    });
            });
    });
});
describe('GET /api/messages/?conversationId', () => {
    test('It should get a messages by conversation id', done => {
        agent
            .post('/api/auth/register')
            .send(fakeUsers[0])
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/register')
                    .send(fakeUsers[1])
                    .expect(200)
                    .then(res => {
                        expect(res.body._id).toBeTruthy();
                        agent
                            .get('/api/users/allUsers')
                            .expect(200)
                            .then(res => {
                                agent
                                    .post('/api/conversations')
                                    .send({
                                        senderId: res.body[0]._id,
                                        receiverId: res.body[1]._id
                                    })
                                    .expect(200)
                                    .then(res => {
                                        expect(res.body._id).toBeTruthy();
                                        const conversationId = res.body._id;
                                        const message = {
                                            sender: res.body.members[0]._id,
                                            text: "newMessage",
                                            seen: false,
                                            conversationId: conversationId,
                                        }
                                        const message2 = {
                                            sender: res.body.members[0]._id,
                                            text: "newMessage2",
                                            seen: false,
                                            conversationId: conversationId,
                                        }
                                        agent
                                            .post('/api/messages')
                                            .send(message)
                                            .expect(200)
                                            .then(res => {
                                                expect(res.body._id).toBeTruthy();
                                                validateNotEmpty(res.body);
                                                validateStringEquality(res.body.text, "newMessage")
                                                agent
                                                    .post('/api/messages')
                                                    .send(message2)
                                                    .expect(200)
                                                    .then(res => {
                                                        expect(res.body._id).toBeTruthy();
                                                        validateNotEmpty(res.body);
                                                        validateStringEquality(res.body.text, "newMessage2")
                                                        agent
                                                            .get(`/api/messages/${conversationId}`)
                                                            .expect(200)
                                                            .then(res => {
                                                                validateNotEmpty(res.body[0])
                                                                validateNotEmpty(res.body[1])
                                                                validateStringEquality(res.body[0].text, "newMessage")
                                                                validateStringEquality(res.body[1].text, "newMessage2")
                                                                done();
                                                            });
                                                    });
                                            });
                                    });

                            });
                    });
            });

    });
    test('It should fail to get  a messages by wrong conversation id', done => {
        agent
            .post('/api/auth/register')
            .send(fakeUsers[0])
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/register')
                    .send(fakeUsers[1])
                    .expect(200)
                    .then(res => {
                        expect(res.body._id).toBeTruthy();
                        agent
                            .get('/api/users/allUsers')
                            .expect(200)
                            .then(res => {
                                agent
                                    .post('/api/conversations')
                                    .send({
                                        senderId: res.body[0]._id,
                                        receiverId: res.body[1]._id
                                    })
                                    .expect(200)
                                    .then(res => {
                                        expect(res.body._id).toBeTruthy();
                                        const conversationId = res.body._id;
                                        const message = {
                                            sender: res.body.members[0]._id,
                                            text: "newMessage",
                                            seen: false,
                                            conversationId: conversationId,
                                        }
                                        const message2 = {
                                            sender: res.body.members[0]._id,
                                            text: "newMessage2",
                                            seen: false,
                                            conversationId: conversationId,
                                        }
                                        agent
                                            .post('/api/messages')
                                            .send(message)
                                            .expect(200)
                                            .then(res => {
                                                expect(res.body._id).toBeTruthy();
                                                validateNotEmpty(res.body);
                                                validateStringEquality(res.body.text, "newMessage")
                                                agent
                                                    .post('/api/messages')
                                                    .send(message2)
                                                    .expect(200)
                                                    .then(res => {
                                                        expect(res.body._id).toBeTruthy();
                                                        validateNotEmpty(res.body);
                                                        validateStringEquality(res.body.text, "newMessage2")
                                                        agent
                                                            .get(`/api/messages/wrongConversationId`)
                                                            .expect(200)
                                                            .then(res => {
                                                                expect(res.body).toEqual([])
                                                                done();
                                                            });
                                                    });
                                            });
                                    });

                            });
                    });
            });

    });
});
describe('PUT /api/messages/?messageId', () => {
    test('It should update a message to seen by messageId', done => {
        agent
            .post('/api/auth/register')
            .send(fakeUsers[0])
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/register')
                    .send(fakeUsers[1])
                    .expect(200)
                    .then(res => {
                        expect(res.body._id).toBeTruthy();
                        agent
                            .get('/api/users/allUsers')
                            .expect(200)
                            .then(res => {
                                agent
                                    .post('/api/conversations')
                                    .send({
                                        senderId: res.body[0]._id,
                                        receiverId: res.body[1]._id
                                    })
                                    .expect(200)
                                    .then(res => {
                                        expect(res.body._id).toBeTruthy();
                                        const conversationId = res.body._id;
                                        const message = {
                                            sender: res.body.members[0]._id,
                                            text: "newMessage",
                                            seen: false,
                                            conversationId: conversationId,
                                        }
                                        agent
                                            .post('/api/messages')
                                            .send(message)
                                            .expect(200)
                                            .then(res => {
                                                const messageId = res.body._id;
                                                expect(messageId).toBeTruthy();
                                                validateNotEmpty(res.body);
                                                validateStringEquality(res.body.text, "newMessage")
                                                agent
                                                    .put(`/api/messages/${messageId}`)
                                                    .expect(200)
                                                    .then(res => {
                                                        validateNotEmpty(res.body);
                                                        validateStringEquality(res.body.updateModel.seen, true)
                                                        validateStringEquality(message.seen, false)
                                                        done();
                                                    });
                                            });
                                    });

                            });
                    });
            });

    });
    test('It should fail to update a message to seen by wrong messageId', done => {
        agent
            .post('/api/auth/register')
            .send(fakeUsers[0])
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/register')
                    .send(fakeUsers[1])
                    .expect(200)
                    .then(res => {
                        expect(res.body._id).toBeTruthy();
                        agent
                            .get('/api/users/allUsers')
                            .expect(200)
                            .then(res => {
                                agent
                                    .post('/api/conversations')
                                    .send({
                                        senderId: res.body[0]._id,
                                        receiverId: res.body[1]._id
                                    })
                                    .expect(200)
                                    .then(res => {
                                        expect(res.body._id).toBeTruthy();
                                        const conversationId = res.body._id;
                                        const message = {
                                            sender: res.body.members[0]._id,
                                            text: "newMessage",
                                            seen: false,
                                            conversationId: conversationId,
                                        }
                                        agent
                                            .post('/api/messages')
                                            .send(message)
                                            .expect(200)
                                            .then(res => {
                                                const messageId = res.body._id;
                                                expect(messageId).toBeTruthy();
                                                validateNotEmpty(res.body);
                                                validateStringEquality(res.body.text, "newMessage")
                                                agent
                                                    .put(`/api/messages/wrongMessageId`)
                                                    .expect(500)
                                                    .then(res => {
                                                        done();
                                                    });
                                            });
                                    });

                            });
                    });
            });

    });
});
