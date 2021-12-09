import {AuthHandler} from "./auth-handler";
import {AuthContext} from "./auth-context";

export class AuthMock extends AuthHandler {
    decode(_: string): AuthContext {
        return {
            organization: "DLRG Hamburg",
            roles: ["dispatcher"],
            username: "timonmasberg"
        };
    }
}
