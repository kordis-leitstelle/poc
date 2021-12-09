import {AuthHandler} from "./auth-handler";

test('should extract token', () => {
    const mockAuthHeaderBearer = "Bearer 123";
    const mockAuthHeaderWithoutBearer = "123"
    expect(AuthHandler.getTokenFromHeader(mockAuthHeaderBearer)).toBe("123");
    expect(AuthHandler.getTokenFromHeader(mockAuthHeaderWithoutBearer)).toBe("123");
});
