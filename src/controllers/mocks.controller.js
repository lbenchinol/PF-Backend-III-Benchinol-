import { fakerES_MX as fa } from "@faker-js/faker"
import bcrypt from "bcrypt"

import PetsController from "./pets.controller.js";
import UsersController from "./users.controller.js";

const generatePet = async (req, res) => {
    try {
        const pets = req.body.pets || 1;
        let payload = [];

        for (let i = 0; i < pets; i++) {
            let _id = fa.database.mongodbObjectId();
            let name = fa.animal.petName();
            let specie = fa.animal.type();
            let birthDate = fa.date.birthdate({ min: 1, max: 15, mode: 'age' });
            payload.push({ _id, name, specie, birthDate });
        }
        res.send({ status: "success", payload });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
}

const generateUser = async (req, res) => {
    try {
        const users = req.body.users || 1;
        let payload = [];

        for (let i = 0; i < users; i++) {
            let _id = fa.database.mongodbObjectId();
            let first_name = fa.person.firstName();
            let last_name = fa.person.lastName();
            let email = fa.internet.email({ firstName: first_name, lastName: last_name, provider: 'gmail.com' });
            let password = bcrypt.hashSync("coder123", 10);
            let role = Math.random() < 0.5 ? 'user' : 'admin';
            let pets = [];
            payload.push({ _id, first_name, last_name, email, password, role, pets });
        }
        res.send({ status: "success", payload });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
}

const generateData = async (req, res) => {
    try {
        const timesPets = req.body.pets || 1;
        const timesUsers = req.body.users || 1;

        for (let i = 0; i < timesPets; i++) {
            let name = fa.animal.petName();
            let specie = fa.animal.type();
            let birthDate = fa.date.birthdate({ min: 1, max: 15, mode: 'age' });
            req.body = { name, specie, birthDate };
            await PetsController.createPet;
        }

        for (let i = 0; i < timesUsers; i++) {
            let first_name = fa.person.firstName();
            let last_name = fa.person.lastName();
            let email = fa.internet.email({ firstName: first_name, lastName: last_name, provider: 'gmail.com' });
            let password = 'coder123';
            let role = Math.random() < 0.5 ? 'user' : 'admin';
            req.body = { first_name, last_name, email, password, role };
            await UsersController.createUser;
        }

        res.send({ status: "success" });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
}

export default { generatePet, generateUser, generateData }