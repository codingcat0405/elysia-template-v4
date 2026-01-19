

import * as jwt from "jsonwebtoken";
import { getRepository } from "../db";
import { User } from "../entities/User";

class UserService {

  async register(username: string, password: string) {
    const userRepository = getRepository().user;
    const existUser = await userRepository.findOne({ where: { username } })
    if (existUser) {
      throw new Error("User already exists")
    }
    const hashPassword = await Bun.password.hash(password, 'bcrypt')
    const user = new User()
    user.username = username
    user.password = hashPassword
    return await userRepository.save(user)
  }

  async login(username: string, password: string) {
    const userRepository = getRepository().user;
    const user = await userRepository.findOne({ where: { username } })
    if (!user) {
      throw new Error("User not found")
    }
    const isValid = await Bun.password.verify(password, user.password, 'bcrypt')
    if (!isValid) {
      throw new Error("Invalid password")
    }
    //generate token
    const token = jwt.sign({ id: Number(user.id), role: user.role }, process.env.JWT_SECRET ?? "")

    return {
      user: {
        id: Number(user.id),
        username: user.username,
        role: user.role
      },
      jwt: token
    }
  }
}

export default UserService