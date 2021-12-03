import {Injectable} from '@nestjs/common';
import {Operation} from "../models/operation.model";

@Injectable()
export class OperationsService {
    private readonly operations: Operation[] = [
        {
            sign: "1",
            begin: new Date(2021, 6, 28, 14, 39, 7),
            end: new Date(2021, 6, 28, 16, 39, 7),
            location: "",
        },
        {
            sign: "2",
            begin: new Date(2021, 6, 28, 15, 39, 7),
            end: new Date(2021, 6, 28, 17, 39, 7),
            location: "",
            archived: true
        },
        {
            sign: "3",
            begin: new Date(2021, 6, 28, 15, 40, 7),
            end: new Date(2021, 6, 28, 16, 39, 7),
            location: "",
        },
        {sign: "4", begin: new Date(2021, 6, 16, 14, 39, 7), location: ""},
        {sign: "5", begin: new Date(2021, 6, 17, 14, 39, 7), location: ""},
        {sign: "6", begin: new Date(2021, 6, 18, 14, 39, 7), location: ""},
    ];

    createOngoing(location: string): Operation {
        const operation = {
            begin: new Date(),
            location,
            sign: this.generateSign()
        }
        this.operations.push(operation);

        return operation;
    }

    findBySign(sign: string): Operation {
        return this.operations.find(operation => operation.sign === sign);
    }

    findArchived(): Operation[] {
        return this.operations.filter(operation => operation.archived);
    }

    findActive(): Operation[] {
        return this.operations.filter(operation => !operation.end);
    }

    findAll(): Operation[] {
        return this.operations;
    }

    private generateSign(): string {
        const newSign  = this.operations.reduce((max, operation) => {
            const sign = Number(operation.sign);
            return sign > max ? sign : max
        }, 0)

        return String(newSign)
    }
}
