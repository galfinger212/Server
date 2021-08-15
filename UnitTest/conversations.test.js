const app = require('../app')
const request = require('supertest');
const db = require('./db-handler');
const Conversation = require('../models/Conversation');
const { fakeUsers, fakeConversationData } = require('../fixtures/index');
const { validateNotEmpty, validateStringEquality } = require('../utils/test-utils/validators.utils');

const agent = request.agent(app);


beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Save conversation to mongo', () => {
    test('it should validate saving a new conversation successfully', async () => {
        const validConversation = new Conversation(fakeConversationData);
        const savedConversation = await validConversation.save();

        validateNotEmpty(savedConversation);
        validateStringEquality(savedConversation.members[0], fakeConversationData.members[0]);
        validateStringEquality(savedConversation.members[1], fakeConversationData.members[1]);
    });

});

describe('POST /api/conversations/', () => {
    test('It should create a new conversation', done => {
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
                                        done();
                                    });

                            });
                    });
            });
    });
    test('It should fail to create a new conversation', done => {
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
                                        senderId: null,
                                        receiverId: res.body[1]._id
                                    })
                                    .expect(500)
                                    .then(res => {
                                        done();
                                    });

                            });
                    });
            });
    });

});

describe('GET /api/conversations/find/?firstUserId/?secondUserId', () => {
    test('It should get a conversation by users id', done => {
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
                                const userId1 = res.body[0]._id;
                                const userId2 = res.body[1]._id;
                                agent
                                    .post('/api/conversations')
                                    .send({
                                        senderId: userId1,
                                        receiverId: userId2
                                    })
                                    .expect(200)
                                    .then(res => {
                                        const conversationId = res.body._id;
                                        expect(conversationId).toBeTruthy();
                                        agent
                                            .get(`/api/conversations/find/${userId1}/${userId2}`)
                                            .expect(200)
                                            .then(res => {
                                                validateStringEquality(res.body._id, conversationId)
                                                done();
                                            });
                                    });

                            });
                    });
            });
    });
    test('It should fail to get a conversation by wrong users id', done => {
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
                                        const conversationId = res.body._id;
                                        expect(conversationId).toBeTruthy();
                                        agent
                                            .get(`/api/conversations/find/wrongId1/wrongId2`)
                                            .expect(404)
                                            .then(res => {
                                                done();
                                            });
                                    });

                            });
                    });
            });
    });
});

