import { AppDataSource } from "./data-source";
import { Repository } from "typeorm";
import { User } from "./entities/User";

export interface IRepository {
  user: Repository<User>;
}

let repository: IRepository;

export const getRepository = () => {
  if (repository) return repository;

  repository = {
    user: AppDataSource.getRepository(User),
  }

  return repository;
}