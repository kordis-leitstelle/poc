import { Injectable } from '@nestjs/common';
import {RadioCall} from "../../models/radio-call.model";

@Injectable()
export class RadioCallsService {
    private readonly radioCalls: RadioCall[] = [
        {
            id: "1",
            time: new Date(2021, 6, 28, 14, 22, 7),
            sendingUnit: "HH 12/42",
            receivingUnit: "HH 10/0",
            message: "An der Wache"
        },
        {
            id: "2",
            time: new Date(2021, 6, 28, 14, 39, 8),
            sendingUnit: "HH 12/42",
            receivingUnit: "HH 10/0",
            message: "Einsatzinfo"
        },
        {
            id: "3",
            time: new Date(2021, 6, 28, 14, 40, 7),
            sendingUnit: "HH 12/41",
            receivingUnit: "HH 10/0",
            message: "Weitere Informationen"
        },
        {
            id: "4",
            time: new Date(2021, 6, 28, 14, 50, 7),
            sendingUnit: "HH 10/0",
            receivingUnit: "HH 13/0",
            message: "Informationen",
        },
        {
            id: "5",
            time: new Date(2021, 6, 28, 14, 39, 7),
            sendingUnit: "HH 12/51",
            receivingUnit: "HH 10/0",
            message: "Auf K Fahrt",
            archived: true
        },
    ]

    findById(id: string): RadioCall {
        return this.radioCalls.find(radioCall => radioCall.id === id);
    }

    findInTimeRange(begin: Date, end: Date): RadioCall[] {
        return this.radioCalls.filter(radioCall =>  begin <= radioCall.time && radioCall.time <= end);
    }

    findArchived(): RadioCall[] {
        return this.radioCalls.filter(radioCall => radioCall.archived);
    }

    findActive(): RadioCall[] {
        return this.radioCalls.filter(radioCall => !radioCall.archived);
    }

    create(sendingUnit: string, receivingUnit: string, message: string): RadioCall {
        const radioCall = {
            id: this.getNewId(),
            sendingUnit,
            receivingUnit,
            message,
            time: new Date()
        }
        this.radioCalls.push(radioCall)

        return radioCall
    }

    private getNewId(): string {
        return ""
    }
}

