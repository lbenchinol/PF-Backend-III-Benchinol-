import { usersService } from "../services/index.js"
import bcrypt from "bcrypt";

const getAllUsers = async (req, res) => {
    try {
        const users = await usersService.getAll();
        res.send({ status: "success", payload: users });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al obtener usuarios" });
    }
}

const getUser = async (req, res) => {
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: "error", error: "User not found" });
        res.send({ status: "success", payload: user });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al obtener usuario" });
    }
}

const updateUser = async (req, res) => {
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: "error", error: "User not found" });
        const result = await usersService.update(userId, updateBody);
        res.send({ status: "success", message: "User updated" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al actualizar usuario" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.uid;
        const result = await usersService.getUserById(userId);
        res.send({ status: "success", message: "User deleted" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al eliminar usuario" });
    }
}

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role = 'user' } = req.body;
        if (!first_name || !last_name || !email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        const passwordEncrypted = bcrypt.hashSync(password, 10);
        const user = { first_name, last_name, email, passwordEncrypted, role };
        const result = await usersService.create(user);
        res.send({ status: "success", payload: result });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Could not create pet" });
    }
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    createUser
}