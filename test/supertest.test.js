import { describe, it } from "mocha"
import { expect } from "chai"
import mongoose from "mongoose"
import supertest from "supertest"

import { connnectMongoDB } from '../src/db/mongodb.js';

import mocksController from '../src/controllers/mocks.controller.js';
import usersController from '../src/controllers/users.controller.js';
import petsController from '../src/controllers/pets.controller.js';
import adoptionsController from '../src/controllers/adoptions.controller.js';
import adoptionModel from '../src/dao/models/Adoption.js';

try {
    connnectMongoDB();
} catch (error) {
    console.log('Error al conectar con la DB');
}

// Funcion auxiliar para llamar a Controller como si fuera hhtp
async function callControllerReturnSent(fn, req = {}) {
    let sent;
    let statusCode = 200;
    const res = {
        send: (v) => { sent = v; return v; },
        json: (v) => { sent = v; return v; },
        status(code) { statusCode = code; return this; }
    };
    const fakeReq = {
        body: req.body || {},
        params: req.params || {},
        query: req.query || {},
        file: req.file || undefined
    };
    await fn(fakeReq, res);
    return { statusCode, body: sent };
}

const requester = supertest("http://localhost:8080");

describe("Test Router Adoption", function () {

    let userMock;
    let petAdoptedMock;
    let pet2AdoptedMock;
    let petNotAdoptedMock;
    let adoption1;
    let adoption2;

    before(async () => {

        // Generacion de Mocks
        const responseUser = await callControllerReturnSent(mocksController.generateUser, { body: { users: 1 } });
        const responsePets = await callControllerReturnSent(mocksController.generatePet, { body: { pets: 3 } });

        if (!responseUser.body || !responseUser.body.payload || !Array.isArray(responseUser.body.payload)) throw new Error('generateUser did not return payload');
        if (!responsePets.body || !responsePets.body.payload || !Array.isArray(responsePets.body.payload)) throw new Error('generatePet did not return payload');

        let user1 = responseUser.body.payload[0];
        delete user1._id;
        delete user1.role;
        delete user1.pets;
        user1.last_name = 'test';
        user1.password = 'password123';

        let pet1 = responsePets.body.payload[0];
        delete pet1._id;
        pet1.specie = 'test';
        let pet2 = responsePets.body.payload[1];
        delete pet2._id;
        pet2.specie = 'test';
        let pet3 = responsePets.body.payload[2];
        delete pet3._id;
        pet3.specie = 'test';

        // Creacion de user y pets
        const respUser1 = await callControllerReturnSent(usersController.createUser, { body: user1 });
        if (!respUser1.body || !respUser1.body.payload) throw new Error('createUser failed');
        userMock = respUser1.body.payload;

        const respPet1 = await callControllerReturnSent(petsController.createPet, { body: pet1 });
        if (!respPet1.body || !respPet1.body.payload) throw new Error('createPet pet1 failed');
        petAdoptedMock = respPet1.body.payload;

        const respPet2 = await callControllerReturnSent(petsController.createPet, { body: pet2 });
        if (!respPet2.body || !respPet2.body.payload) throw new Error('createPet pet2 failed');
        pet2AdoptedMock = respPet2.body.payload;

        const respPet3 = await callControllerReturnSent(petsController.createPet, { body: pet3 });
        if (!respPet3.body || !respPet3.body.payload) throw new Error('createPet pet3 failed');
        petNotAdoptedMock = respPet3.body.payload;

        //  Creacion de Adoptions
        await callControllerReturnSent(adoptionsController.createAdoption, { params: { uid: userMock._id, pid: petAdoptedMock._id } });
        await callControllerReturnSent(adoptionsController.createAdoption, { params: { uid: userMock._id, pid: pet2AdoptedMock._id } });

        //  Busqueda ID adoptions
        const respAdoption = await adoptionModel.find({ owner: userMock._id });
        adoption1 = respAdoption[0];
        adoption2 = respAdoption[1];

    });


    after(async () => {
        //  Borrado de los mocks usados
        await mongoose.connection.collection("users").deleteMany({ last_name: "test" });
        await mongoose.connection.collection("pets").deleteMany({ specie: "test" });
        await mongoose.connection.collection("adoptions").deleteMany({ owner: userMock._id });
    });


    //  ----------  getAllAdoptions
    it('El método GET /api/adoptions retorna un objeto con la propiedad payload conteniendo a todas las adopciones', async () => {
        let { body } = await requester.get('/api/adoptions');
        expect(JSON.stringify(body.payload[0].pet)).to.be.eq(JSON.stringify(petAdoptedMock._id));
        expect(JSON.stringify(body.payload[1].pet)).to.be.eq(JSON.stringify(pet2AdoptedMock._id));
    });


    it('El método GET /api/adoptions retorna un objeto con la propiedad payload de tipo array', async () => {
        let { body } = await requester.get("/api/adoptions");
        expect(Array.isArray(body.payload)).to.be.true;
    });

    it('El método GET /api/adoptions retorna un objeto con la propiedad status igual a success', async () => {
        let { body } = await requester.get("/api/adoptions");
        expect(body).to.has.property('status').to.be.eq('success');
    });


    //  ----------  getAdoption
    it('El método GET /api/adoptions/:aid retorna un objeto con la propiedad payload conteniendo a la adopción solicitada', async () => {
        let { body } = await requester.get(`/api/adoptions/${adoption1._id}`);
        expect(JSON.stringify(body.payload._id)).to.be.eq(JSON.stringify(adoption1._id));
    });

    it('El método GET /api/adoptions/:aid retorna un objeto con la propiedad status igual a success', async () => {
        let { body } = await requester.get(`/api/adoptions/${adoption1._id}`);
        expect(body).to.has.property('status').to.be.eq('success');
    });

    it('El método GET /api/adoptions/:aid envía AID erróneo, retorna un objeto con la propiedad status HTTP 404', async () => {
        let { statusCode } = await requester.get(`/api/adoptions/000000000000000000000000`);
        expect(statusCode).to.be.eq(404);
    });


    //  ----------  createAdoption
    it('El método POST /api/adoptions/:uid/:pid si lo datos son correctos, retorna un objeto con la propiedad status igual a success', async () => {
        let { body } = await requester.post(`/api/adoptions/${userMock._id}/${petNotAdoptedMock._id}`);
        expect(body).to.has.property('status').to.be.eq('success');
    });


    it('El método POST /api/adoptions/:uid/:pid envía UID erróneo, retorna un objeto con la propiedad status igual HTTP 404', async () => {
        let { statusCode } = await requester.post(`/api/adoptions/000000000000000000000000/${petNotAdoptedMock._id}`);
        expect(statusCode).to.be.eq(404);
    });

    it('El método POST /api/adoptions/:uid/:pid envía PID erróneo, retorna un objeto con la propiedad status igual HTTP 404', async () => {
        let { statusCode } = await requester.post(`/api/adoptions/${userMock._id}/000000000000000000000000`);
        expect(statusCode).to.be.eq(404);
    });

    it('El método POST /api/adoptions/:uid/:pid envía PID adoptado, al intentar crear nueva Adoption, retorna un objeto con la propiedad status igual HTTP 400', async () => {
        let { statusCode } = await requester.post(`/api/adoptions/${userMock._id}/${petAdoptedMock._id}`);
        expect(statusCode).to.be.eq(400);
    });

});