import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveyUsersRespository } from "../repositories/SurveysUsersRepository";
import { Survey } from "../models/Survey";
import SendMailService from "../services/SendMailService";
import { AppError } from "../errors/AppError";

class SendEmailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;


        const usersRespository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveyUsersRespository = getCustomRepository(SurveyUsersRespository);

        const user = await usersRespository.findOne({email});

        if(!user) {
            throw new AppError("User does not exists", 400)      
        }

        const survey = await surveysRepository.findOne({id: survey_id});

        if(!survey) {
            throw new AppError("Survey does not exists", 400)      
        }

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
              
    const surveyUserAlreadyExist = await surveyUsersRespository.findOne({
        where: {user_id: user.id, value: null},
        relations: ["user", "survey"]
    });

    const variables = {
        name: user.name,
        title: survey.title,
        description: survey.description,
        id: "",
        link: process.env.URL_MAIL,
    }

    if(surveyUserAlreadyExist) {
        variables.id = surveyUserAlreadyExist.id;
        await SendMailService.execute(email, survey.title, variables, npsPath);
        return response.json(surveyUserAlreadyExist);
    }

    const surveyUser = surveyUsersRespository.create({
        user_id: user.id,
        survey_id
    });
  
    await surveyUsersRespository.save(surveyUser);

    variables.id = surveyUser.id;
   
    await SendMailService.execute(email, survey.title, variables, npsPath)
    
    return response.json(surveyUser)

 }


}

export { SendEmailController };