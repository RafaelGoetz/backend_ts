import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { SurveyUsersRespository } from "../repositories/SurveysUsersRepository"

class NpsController {
    async execute(request: Request, response: Response) {
        const { survey_id } = request.params

        const surveysUsersRepository = getCustomRepository(SurveyUsersRespository)

        const surveyUsers = await surveysUsersRepository.find({
            survey_id,
            value: Not(IsNull()),
        })

        const detractor = surveyUsers.filter(
            (survey) => (survey.value >= 0 && survey.value <= 6)).length

        const promoters = surveyUsers.filter((survey) => 
            (survey.value >= 9 && survey.value <= 10)).length

        const passive = surveyUsers.filter((survey) => 
            (survey.value >= 7 && survey.value <= 8)).length

        const totalAswers = surveyUsers.length;

        const calculate = Number(
            Math.abs(((promoters - detractor) / totalAswers) * 100)
            );

        if(calculate < 0) {
            return calculate * -1
        }

        return response.json({
            detractor,
            promoters,
            passive,
            totalAswers,
            nps: calculate
        })
    }
}

export { NpsController }