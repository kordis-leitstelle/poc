export interface RadioCall {
    id: string,
    time: Date,
    sendingUnit: string,
    receivingUnit: string,
    message: string,
    archived?: boolean
}
