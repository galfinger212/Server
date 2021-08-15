const app = require('../app')
const request = require('supertest');
const db = require('./db-handler');
const User = require('../models/User');
const { fakeUserData, fakeUsers } = require('../fixtures/index');
const { validateNotEmpty, validateStringEquality } = require('../utils/test-utils/validators.utils');

const agent = request.agent(app);


beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Save user to mongo', () => {
    test('it should validate saving a new user successfully', async () => {
        const validUser = new User(fakeUserData);
        const savedUser = await validUser.save();

        validateNotEmpty(savedUser);

        validateStringEquality(savedUser.email, fakeUserData.email);
        validateStringEquality(savedUser.username, fakeUserData.username
        );
        validateStringEquality(savedUser.password, fakeUserData.password
        );
    });

});

describe('POST /api/auth/register', () => {
    test('It should create a new user', done => {
        agent
            .post('/api/auth/register')
            .send({
                username: "galfinger111",
                email: "galfinger@gmail.com",
                password: "123456",
            })
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                done();
            });
    });
    test('It should failed to create a new user - password length invalid ', done => {
        agent
            .post('/api/auth/register')
            .send({
                username: "galfinger111",
                email: "galfinger@gmail.com",
                password: "",
            })
            .expect(500)
            .then(res => {
                done();
            });

    });
});

describe('POST /api/auth/login', () => {
    test('It should success login with valid user', done => {
        agent
            .post('/api/auth/register')
            .send({
                username: "galfinger111",
                email: "galfinger@gmail.com",
                password: "123456",
            })
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/login')
                    .send({
                        username: "galfinger111",
                        password: "123456",
                    })
                    .expect(200)
                    .then(res => {
                        expect(res.body._id).toBeTruthy();
                        done();
                    });
            });

    });
    test('It should not success login with InValid password', done => {
        agent
            .post('/api/auth/register')
            .send({
                username: "galfinger111",
                email: "galfinger@gmail.com",
                password: "123456",
            })
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/login')
                    .send({
                        username: "galfinger111",
                        password: "123455",
                    })
                    .expect(400)
                    .then(res => {
                        done();
                    });
            });

    });
    test('It should not success login with InValid email', done => {
        agent
            .post('/api/auth/register')
            .send({
                username: "galfinger111",
                email: "galfinger@gmail.com",
                password: "123456",
            })
            .expect(200)
            .then(res => {
                expect(res.body._id).toBeTruthy();
                agent
                    .post('/api/auth/login')
                    .send({
                        email: "galfinger1@gmail.com",
                        password: "123456",
                    })
                    .expect(404)
                    .then(res => {
                        done();
                    });
            });

    });
});

describe('GET /api/users', () => {
    test('It should success get all Users', done => {
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
                                validateNotEmpty(res.body[0])
                                validateNotEmpty(res.body[1])
                                validateStringEquality(res.body[0].email, fakeUsers[0].email)
                                validateStringEquality(res.body[0].username, fakeUsers[0].username)
                                validateStringEquality(res.body[1].email, fakeUsers[1].email)
                                validateStringEquality(res.body[1].username, fakeUsers[1].username)
                                done();
                            });
                    });
            });

    });

    test('It should success get user by username', done => {
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
                            .get('/api/users/')
                            .query({ username: fakeUsers[0].username })
                            .expect(200)
                            .then(res => {
                                validateNotEmpty(res.body)
                                validateStringEquality(res.body.email, fakeUsers[0].email)
                                validateStringEquality(res.body.username, fakeUsers[0].username)
                                done();
                            });
                    });
            });

    });
    test('It should fail get user by wrong username', done => {
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
                            .get('/api/users/')
                            .query({ username: "wrongUserName" })
                            .expect(500)
                            .then(res => {
                                done();
                            });
                    });
            });

    });
});