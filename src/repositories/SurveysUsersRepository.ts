import { EntityRepository, Repository } from "typeorm";
import { SurveyUser } from "../models/SurveyUser";

@EntityRepository(SurveyUser)
class SurveyUsersRespository extends Repository<SurveyUser> {}

export { SurveyUsersRespository };