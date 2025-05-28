// services/templateApprovalStageService.js
import NotificationService from '../modules/Notification/Notification.service.js';
import TemplateApprovalStageService from '../modules/TemplateApproval/TemplateApprovalStage.service.js';
import UserService from '../modules/User/User.service.js';

export const handleEscalations = async () => {
    const templateApprovalStageService = new TemplateApprovalStageService();
    const userService = new UserService();
    const notificationService = new NotificationService();

    try {
        const stagesToEscalate = await templateApprovalStageService.getStageNeedToEscalate({
            // limit,
            raw: true
        });
        console.log("stagesToEscalate", stagesToEscalate)
        if (!stagesToEscalate?.length)
            return;

        for (const stage of stagesToEscalate) {

            if (stage?.escalators?.length)
                for (const mail of stage?.escalators) {
                    const user = await userService.findByEmail({ email: mail })
                    if (user)
                        await notificationService.create({
                            type: "ESCALATION",
                            templateId: stage['approval.templateId'],
                            sendTo: user?.id,
                        })
                }


            // update as escalated
            await templateApprovalStageService.update(
                stage.id,
                {
                    isEscalated: true
                }
            )

        }

    } catch (error) {
        console.log(error)
    }
};
