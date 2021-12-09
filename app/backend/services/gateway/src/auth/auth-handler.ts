import {AuthContext} from "./auth-context";

export abstract class AuthHandler {
    abstract decode(token?: string): AuthContext;

    private static TOKEN_HEADER_REG = /^Bearer (.+)$/i;
    static getTokenFromHeader(headerValue: string): string {
        const matches = headerValue.match(this.TOKEN_HEADER_REG)
        if (matches && matches.length >= 1){
            return matches[1]
        }

        return headerValue;
    }
}
