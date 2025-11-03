import { describe, it } from "mocha"
import { expect } from "chai"
import mongoose from "mongoose"
import supertest from "supertest"

import mocksController from '../src/controllers/mocks.controller.js';

await mongoose.connect('mongodb://localhost:27017/Coder-Adoptme');

const requester = supertest("http://localhost:8080");

describe("Test Router Adoption", function () {

    let userMock;
    let petAdoptedMock;
    let pet2AdoptedMock;
    let petNotAdoptedMock;

    before(async () => {
        userMock = await mocksController.generateUser();
        userMock.last_name = 'test';
        petAdoptedMock = await mocksController.generatePet();
        petAdoptedMock.specie = 'test';
        petAdoptedMock.adopted = true;
        pet2AdoptedMock = await mocksController.generatePet();
        pet2AdoptedMock.specie = 'test';
        pet2AdoptedMock.adopted = true;
        petNotAdoptedMock = await mocksController.generatePet();
        petNotAdoptedMock.specie = 'test';

        await fetch("http://localhost:8080/api/users/", {
            method: "POST",
            body: userMock
        });

        await fetch("http://localhost:8080/api/pets/", {
            method: "POST",
            body: petAdoptedMock
        });

        await fetch("http://localhost:8080/api/pets/", {
            method: "POST",
            body: pet2AdoptedMock
        });

        await fetch("http://localhost:8080/api/pets/", {
            method: "POST",
            body: petNotAdoptedMock
        });

    });

    after(async () => {
        await mongoose.connection.collection("Adoptions").deleteMany({ owner: userMock._id });
        await mongoose.connection.collection("Users").deleteMany({ last_name: "test" });
        await mongoose.connection.collection("Pets").deleteMany({ specie: "test" });
    });


    //  ----------  getAllAdoptions
    it('El método GET /api/adoptions retorna un objeto con la propiedad payload conteniendo a todas las adopciones', async () => {
        const { body } = await requester.get('/api/adoption');
        expect(body.payload[0]._id).to.be.eq(petAdoptedMock._id);
        expect(body.payload[1]._id).to.be.eq(pet2AdoptedMock._id);
    });

    it('El método GET /api/adoptions retorna un objeto con la propiedad payload de tipo array', async () => {
        const { body } = await requester.get("/api/adoptions");
        expect(Array.isArray(body.payload)).to.be.true;
    });

    it('El método GET /api/adoptions retorna un objeto con la propiedad status igual a success', async () => {
        const { body } = await requester.get("/api/adoptions");
        expect(body).to.has.property('status').to.be.eq('success');
    });


    //  ----------  getAdoption
    it('El método GET /api/adoptions/:aid retorna un objeto con la propiedad payload conteniendo a la adopción solicitada', async () => {
        const { body } = await requester.get(`/api/adoptions/${petAdoptedMock._id}`);
        expect(body.payload[0]._id).to.be.eq(petAdoptedMock._id);
        expect(body.payload[0].name).to.be.eq(petAdoptedMock.name);
        expect(body.payload[0].specie).to.be.eq(petAdoptedMock.specie);
        expect(body.payload[0].birthDate).to.be.eq(petAdoptedMock.birthDate);
    });

    it('El método GET /api/adoptions/:aid retorna un objeto con la propiedad status igual a success', async () => {
        const { body } = await requester.get(`/api/adoptions/${petAdoptedMock._id}`);
        expect(body).to.has.property('status').to.be.eq('success');
    });

    it('El método GET /api/adoptions/:aid envía AID erróneo, retorna un objeto con la propiedad status HTTP 404', async () => {
        const { statusCode } = await requester.get(`/api/adoptions/AIDErroneo`);
        expect(statusCode).to.be.eq(404);
    });


    //  ----------  createAdoption
    it('El método POST /api/adoptions/:uid/:pid si lo datos son correctos, retorna un objeto con la propiedad status igual a success', async () => {
        const { body } = await requester.post(`/api/adoptions/${userMock._id}/${petNotAdoptedMock._id}`);
        expect(body).to.has.property('status').to.be.eq('success');
    });


    it('El método POST /api/adoptions/:uid/:pid envía UID erróneo, retorna un objeto con la propiedad status igual HTTP 404', async () => {
        const { statusCode } = await requester.post(`/api/adoptions/UIDErroneo/${petNotAdoptedMock._id}`);
        expect(statusCode).to.be.eq(404);
    });

    it('El método POST /api/adoptions/:uid/:pid envía PID erróneo, retorna un objeto con la propiedad status igual HTTP 404', async () => {
        const { statusCode } = await requester.post(`/api/adoptions/${userMock._id}/PIDErroneo`);
        expect(statusCode).to.be.eq(404);
    });

    it('El método POST /api/adoptions/:uid/:pid envía PID adoptado, retorna un objeto con la propiedad status igual HTTP 400', async () => {
        const { statusCode } = await requester.post(`/api/adoptions/${userMock._id}/${petAdoptedMock._id}`);
        expect(statusCode).to.be.eq(400);
    });

});